## 7. Performance, Caching, and Scalability

### 7.1 Database Query Optimization

**Goal**: Minimize query overhead for high-traffic product pages while maintaining data freshness.

#### Indexing Strategy

Add custom indexes to WordPress database tables (via plugin activation hook):

```php
// wordpress/mebl-review-bridge/includes/class-database-optimizer.php
class MEBL_Review_Database_Optimizer {

    public static function create_indexes() {
        global $wpdb;

        // Index for product review queries (most common)
        $wpdb->query("
            CREATE INDEX idx_product_reviews
            ON {$wpdb->comments} (comment_post_ID, comment_approved, comment_date DESC)
        ");

        // Index for user review queries
        $wpdb->query("
            CREATE INDEX idx_user_reviews
            ON {$wpdb->comments} (user_id, comment_type, comment_approved)
        ");

        // Index for rating queries (commentmeta)
        $wpdb->query("
            CREATE INDEX idx_rating_meta
            ON {$wpdb->commentmeta} (comment_id, meta_key(50))
        ");

        // Index for verified purchase flag
        $wpdb->query("
            CREATE INDEX idx_verified_meta
            ON {$wpdb->commentmeta} (meta_key(50), meta_value(10))
        ");
    }

    public static function remove_indexes() {
        global $wpdb;
        $wpdb->query("DROP INDEX idx_product_reviews ON {$wpdb->comments}");
        $wpdb->query("DROP INDEX idx_user_reviews ON {$wpdb->comments}");
        $wpdb->query("DROP INDEX idx_rating_meta ON {$wpdb->commentmeta}");
        $wpdb->query("DROP INDEX idx_verified_meta ON {$wpdb->commentmeta}");
    }
}

// Hook into plugin activation
register_activation_hook(__FILE__, [
    'MEBL_Review_Database_Optimizer',
    'create_indexes'
]);

register_deactivation_hook(__FILE__, [
    'MEBL_Review_Database_Optimizer',
    'remove_indexes'
]);
```

#### Query Optimization Patterns

**Aggregate Query with Single JOIN**:

```php
// Fetch review summary with single query
class MEBL_Review_Query_Optimizer {

    public static function get_product_summary($product_id) {
        global $wpdb;

        $cache_key = "mebl_review_summary_{$product_id}";
        $summary = wp_cache_get($cache_key, 'mebl_reviews');

        if (false !== $summary) {
            return $summary;
        }

        // Single optimized query with subqueries
        $query = $wpdb->prepare("
            SELECT
                COUNT(c.comment_ID) as total_reviews,
                AVG(CAST(cm.meta_value AS DECIMAL(3,2))) as average_rating,
                SUM(CASE WHEN cm2.meta_value = '1' THEN 1 ELSE 0 END) as verified_count,
                COUNT(CASE WHEN c.comment_date > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_count
            FROM {$wpdb->comments} c
            INNER JOIN {$wpdb->commentmeta} cm
                ON c.comment_ID = cm.comment_id AND cm.meta_key = 'rating'
            LEFT JOIN {$wpdb->commentmeta} cm2
                ON c.comment_ID = cm2.comment_id AND cm2.meta_key = 'verified_purchase'
            WHERE c.comment_post_ID = %d
                AND c.comment_approved = '1'
                AND c.comment_type = 'review'
        ", $product_id);

        $summary = $wpdb->get_row($query, ARRAY_A);

        // Cache for 1 hour (invalidated on new review)
        wp_cache_set($cache_key, $summary, 'mebl_reviews', HOUR_IN_SECONDS);

        return $summary;
    }

    public static function get_paginated_reviews($product_id, $page = 1, $per_page = 10, $sort = 'date_desc') {
        global $wpdb;

        $offset = ($page - 1) * $per_page;

        // Build ORDER BY clause based on sort parameter
        $order_clause = match($sort) {
            'rating_desc' => 'CAST(cm.meta_value AS DECIMAL(3,2)) DESC, c.comment_date DESC',
            'rating_asc' => 'CAST(cm.meta_value AS DECIMAL(3,2)) ASC, c.comment_date DESC',
            'helpful_desc' => 'helpful_count DESC, c.comment_date DESC',
            default => 'c.comment_date DESC'
        };

        $query = $wpdb->prepare("
            SELECT
                c.comment_ID,
                c.comment_author,
                c.comment_content,
                c.comment_date,
                c.user_id,
                cm.meta_value as rating,
                cm2.meta_value as verified_purchase,
                COALESCE(cm3.meta_value, 0) as helpful_count
            FROM {$wpdb->comments} c
            INNER JOIN {$wpdb->commentmeta} cm
                ON c.comment_ID = cm.comment_id AND cm.meta_key = 'rating'
            LEFT JOIN {$wpdb->commentmeta} cm2
                ON c.comment_ID = cm2.comment_id AND cm2.meta_key = 'verified_purchase'
            LEFT JOIN {$wpdb->commentmeta} cm3
                ON c.comment_ID = cm3.comment_id AND cm3.meta_key = 'helpful_count'
            WHERE c.comment_post_ID = %d
                AND c.comment_approved = '1'
                AND c.comment_type = 'review'
            ORDER BY {$order_clause}
            LIMIT %d OFFSET %d
        ", $product_id, $per_page, $offset);

        return $wpdb->get_results($query, ARRAY_A);
    }
}
```

**Batch Fetching for Multiple Products**:

```php
// When displaying product grids with review counts
public static function get_batch_summaries($product_ids) {
    global $wpdb;

    if (empty($product_ids)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($product_ids), '%d'));

    $query = $wpdb->prepare("
        SELECT
            c.comment_post_ID as product_id,
            COUNT(c.comment_ID) as total_reviews,
            AVG(CAST(cm.meta_value AS DECIMAL(3,2))) as average_rating
        FROM {$wpdb->comments} c
        INNER JOIN {$wpdb->commentmeta} cm
            ON c.comment_ID = cm.comment_id AND cm.meta_key = 'rating'
        WHERE c.comment_post_ID IN ({$placeholders})
            AND c.comment_approved = '1'
            AND c.comment_type = 'review'
        GROUP BY c.comment_post_ID
    ", ...$product_ids);

    $results = $wpdb->get_results($query, ARRAY_A);

    // Return as keyed array for O(1) lookups
    return array_column($results, null, 'product_id');
}
```

#### Query Monitoring

Add query logging for performance tracking:

```php
class MEBL_Review_Query_Monitor {

    public static function init() {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            add_filter('query', [__CLASS__, 'log_slow_queries']);
        }
    }

    public static function log_slow_queries($query) {
        $start_time = microtime(true);

        add_filter('posts_results', function($results) use ($start_time, $query) {
            $execution_time = microtime(true) - $start_time;

            if ($execution_time > 0.1) { // Log queries slower than 100ms
                error_log(sprintf(
                    "[MEBL Reviews] Slow query detected: %.4fs\n%s",
                    $execution_time,
                    $query
                ));
            }

            return $results;
        });

        return $query;
    }
}
```

---

### 7.2 Caching Strategy

**Three-Layer Caching Approach**:

1. **WordPress Object Cache** (in-memory, request-scoped)
2. **WordPress Transients** (persistent, database-backed with optional Redis/Memcached)
3. **Apollo Client Cache** (frontend, normalized GraphQL cache)

#### Layer 1: WordPress Object Cache

Use for short-lived, request-scoped data:

```php
class MEBL_Review_Cache {

    const CACHE_GROUP = 'mebl_reviews';

    // Cache individual review
    public static function cache_review($review_id, $review_data) {
        $key = "review_{$review_id}";
        wp_cache_set($key, $review_data, self::CACHE_GROUP, HOUR_IN_SECONDS);
    }

    // Cache product review list
    public static function cache_product_reviews($product_id, $page, $sort, $reviews) {
        $key = "product_{$product_id}_p{$page}_s{$sort}";
        wp_cache_set($key, $reviews, self::CACHE_GROUP, HOUR_IN_SECONDS);
    }

    // Cache aggregate summary
    public static function cache_summary($product_id, $summary) {
        $key = "summary_{$product_id}";
        wp_cache_set($key, $summary, self::CACHE_GROUP, HOUR_IN_SECONDS * 6);
    }

    // Invalidate all caches for a product
    public static function invalidate_product($product_id) {
        global $wpdb;

        // Clear object cache pattern (requires Redis/Memcached with pattern support)
        wp_cache_delete("summary_{$product_id}", self::CACHE_GROUP);

        // Clear paginated review caches (brute force for pages 1-10)
        for ($page = 1; $page <= 10; $page++) {
            foreach (['date_desc', 'rating_desc', 'helpful_desc'] as $sort) {
                wp_cache_delete("product_{$product_id}_p{$page}_s{$sort}", self::CACHE_GROUP);
            }
        }

        // Clear product meta cache
        wp_cache_delete($product_id, 'post_meta');
    }
}
```

#### Layer 2: WordPress Transients

Use for persistent caching across requests:

```php
class MEBL_Review_Transient_Cache {

    // Cache review summary in database (survives server restarts)
    public static function cache_summary_persistent($product_id, $summary) {
        $transient_key = "mebl_review_summary_{$product_id}";
        set_transient($transient_key, $summary, DAY_IN_SECONDS);
    }

    public static function get_summary_persistent($product_id) {
        $transient_key = "mebl_review_summary_{$product_id}";
        return get_transient($transient_key);
    }

    // Cache rating distribution (5-star breakdown)
    public static function cache_rating_distribution($product_id) {
        global $wpdb;

        $transient_key = "mebl_rating_dist_{$product_id}";

        // Check cache first
        $cached = get_transient($transient_key);
        if (false !== $cached) {
            return $cached;
        }

        // Calculate distribution
        $query = $wpdb->prepare("
            SELECT
                FLOOR(CAST(cm.meta_value AS DECIMAL(3,2))) as rating_floor,
                COUNT(*) as count
            FROM {$wpdb->comments} c
            INNER JOIN {$wpdb->commentmeta} cm
                ON c.comment_ID = cm.comment_id AND cm.meta_key = 'rating'
            WHERE c.comment_post_ID = %d
                AND c.comment_approved = '1'
                AND c.comment_type = 'review'
            GROUP BY rating_floor
            ORDER BY rating_floor DESC
        ", $product_id);

        $results = $wpdb->get_results($query, ARRAY_A);

        // Normalize to 5-star array
        $distribution = array_fill(1, 5, 0);
        foreach ($results as $row) {
            $rating = (int) $row['rating_floor'];
            if ($rating >= 1 && $rating <= 5) {
                $distribution[$rating] = (int) $row['count'];
            }
        }

        set_transient($transient_key, $distribution, DAY_IN_SECONDS);
        return $distribution;
    }

    // Invalidate transients on review approval
    public static function invalidate_transients($product_id) {
        delete_transient("mebl_review_summary_{$product_id}");
        delete_transient("mebl_rating_dist_{$product_id}");
    }
}

// Hook into review approval
add_action('comment_post', function($comment_id, $approved) {
    if ('1' === $approved) {
        $comment = get_comment($comment_id);
        if ('review' === $comment->comment_type) {
            MEBL_Review_Transient_Cache::invalidate_transients($comment->comment_post_ID);
        }
    }
}, 10, 2);
```

#### Layer 3: Apollo Client Cache Configuration

Configure Apollo InMemoryCache with review-specific policies:

```typescript
// src/utils/apollo/ApolloClient.js (extend existing configuration)
import { InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
  typePolicies: {
    Product: {
      fields: {
        reviews: {
          // Cache reviews by pagination arguments
          keyArgs: ['first', 'after', 'sortBy'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;

            // Merge paginated results (cursor-based pagination)
            return {
              ...incoming,
              edges: [...(existing.edges || []), ...(incoming.edges || [])],
            };
          },
        },
        reviewSummary: {
          // Cache summary separately from review list
          merge(existing, incoming) {
            return incoming; // Always replace (server is source of truth)
          },
        },
      },
    },
    Review: {
      keyFields: ['databaseId'], // Use database ID as cache key
    },
  },
});

// Cache eviction on review submission
const submitReview = async (variables) => {
  const result = await client.mutate({
    mutation: SUBMIT_REVIEW,
    variables,
    refetchQueries: [
      {
        query: GET_PRODUCT_REVIEWS,
        variables: { productId: variables.productId },
      },
      {
        query: GET_PRODUCT_REVIEW_SUMMARY,
        variables: { productId: variables.productId },
      },
    ],
    awaitRefetchQueries: true,
  });

  return result;
};
```

#### Cache Warming Strategy

Preload cache for popular products:

```php
// WordPress cron job to warm cache
class MEBL_Review_Cache_Warmer {

    public static function init() {
        add_action('mebl_warm_review_cache', [__CLASS__, 'warm_cache']);

        if (!wp_next_scheduled('mebl_warm_review_cache')) {
            wp_schedule_event(time(), 'hourly', 'mebl_warm_review_cache');
        }
    }

    public static function warm_cache() {
        global $wpdb;

        // Get top 50 products by view count (requires view tracking)
        $popular_products = $wpdb->get_col("
            SELECT post_id
            FROM {$wpdb->postmeta}
            WHERE meta_key = '_view_count'
            ORDER BY CAST(meta_value AS UNSIGNED) DESC
            LIMIT 50
        ");

        foreach ($popular_products as $product_id) {
            // Warm summary cache
            $summary = MEBL_Review_Query_Optimizer::get_product_summary($product_id);
            MEBL_Review_Transient_Cache::cache_summary_persistent($product_id, $summary);

            // Warm first page of reviews
            $reviews = MEBL_Review_Query_Optimizer::get_paginated_reviews($product_id, 1, 10);
            MEBL_Review_Cache::cache_product_reviews($product_id, 1, 'date_desc', $reviews);
        }

        error_log('[MEBL Reviews] Cache warmed for ' . count($popular_products) . ' products');
    }
}

MEBL_Review_Cache_Warmer::init();
```

---

### 7.3 CDN and Static Asset Optimization

#### Review Data as Static JSON (Optional for Phase 2)

Generate static JSON snapshots for product reviews:

```php
// Export reviews as static JSON for CDN caching
class MEBL_Review_Static_Exporter {

    public static function export_product_reviews($product_id) {
        $summary = MEBL_Review_Query_Optimizer::get_product_summary($product_id);
        $reviews = MEBL_Review_Query_Optimizer::get_paginated_reviews($product_id, 1, 100);

        $export = [
            'productId' => $product_id,
            'summary' => $summary,
            'reviews' => $reviews,
            'generatedAt' => current_time('mysql'),
        ];

        $upload_dir = wp_upload_dir();
        $export_dir = $upload_dir['basedir'] . '/review-snapshots/';

        if (!file_exists($export_dir)) {
            wp_mkdir_p($export_dir);
        }

        $file_path = $export_dir . "product-{$product_id}-reviews.json";
        file_put_contents($file_path, wp_json_encode($export, JSON_PRETTY_PRINT));

        return $upload_dir['baseurl'] . "/review-snapshots/product-{$product_id}-reviews.json";
    }

    // Regenerate on review approval
    public static function regenerate_on_approval($comment_id, $approved) {
        if ('1' === $approved) {
            $comment = get_comment($comment_id);
            if ('review' === $comment->comment_type) {
                self::export_product_reviews($comment->comment_post_ID);
            }
        }
    }
}

add_action('comment_post', [MEBL_Review_Static_Exporter::class, 'regenerate_on_approval'], 10, 2);
```

**Next.js Consumption**:

```typescript
// src/utils/functions/fetchStaticReviews.ts
export async function fetchStaticReviews(productId: number) {
  const cdnUrl = `${process.env.NEXT_PUBLIC_WP_UPLOADS_URL}/review-snapshots/product-${productId}-reviews.json`;

  try {
    const response = await fetch(cdnUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error('Static reviews not available');
    }

    return await response.json();
  } catch (error) {
    console.warn('Falling back to GraphQL for reviews:', error);
    return null; // Fall back to GraphQL query
  }
}
```

#### CDN Header Configuration

Configure cache headers in GraphQL responses:

```php
// Add cache headers to GraphQL responses
add_filter('graphql_response_headers', function($headers) {
    // Allow CDN to cache GET requests for 5 minutes
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $headers['Cache-Control'] = 'public, max-age=300, s-maxage=300';
        $headers['Vary'] = 'Accept-Encoding';
    } else {
        // Never cache mutations
        $headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
    }

    return $headers;
});
```

---

### 7.4 Load Testing and Performance Benchmarks

#### Load Testing Setup

**Using Apache Bench (ab)**:

```bash
# Test review list query performance
ab -n 1000 -c 10 \
  -H "Content-Type: application/json" \
  -p query.json \
  https://wordpress2533583.home.pl/graphql

# query.json content:
{
  "query": "query GetProductReviews($productId: Int!) {
    product(id: $productId, idType: DATABASE_ID) {
      reviews(first: 10) {
        edges {
          node {
            databaseId
            author {
              node {
                name
              }
            }
            content
            rating
          }
        }
      }
    }
  }",
  "variables": { "productId": 123 }
}
```

**Using Playwright for End-to-End Performance**:

```typescript
// src/tests/Performance/review-performance.spec.ts
import { test, expect } from '@playwright/test';

test('product page with reviews loads under 2 seconds', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/product/test-cabinet', { waitUntil: 'networkidle' });

  const loadTime = Date.now() - startTime;

  // Assert page loads in under 2 seconds
  expect(loadTime).toBeLessThan(2000);

  // Assert reviews are visible
  await expect(page.locator('[data-testid="review-list"]')).toBeVisible();

  // Measure GraphQL query time via Network panel
  const graphqlTiming = await page.evaluate(() => {
    const entries = performance.getEntriesByType(
      'resource',
    ) as PerformanceResourceTiming[];
    const graphqlEntry = entries.find((e) => e.name.includes('/graphql'));
    return graphqlEntry ? graphqlEntry.duration : 0;
  });

  console.log('GraphQL query duration:', graphqlTiming, 'ms');
  expect(graphqlTiming).toBeLessThan(500); // GraphQL should respond in under 500ms
});

test('review submission completes in under 3 seconds', async ({ page }) => {
  await page.goto('/product/test-cabinet');

  // Fill review form
  await page.fill('[data-testid="review-title"]', 'Great product!');
  await page.fill(
    '[data-testid="review-content"]',
    'This cabinet exceeded my expectations.',
  );
  await page.click('[data-testid="rating-5"]');

  const startTime = Date.now();
  await page.click('[data-testid="submit-review"]');

  // Wait for success message
  await expect(page.locator('[data-testid="review-success"]')).toBeVisible();

  const submissionTime = Date.now() - startTime;
  expect(submissionTime).toBeLessThan(3000);
});
```

#### Performance Benchmarks (Target Metrics)

| Metric                               | Target                            | Measurement Method                   |
| ------------------------------------ | --------------------------------- | ------------------------------------ |
| **Review List Query**                | <200ms (cached) <500ms (uncached) | GraphQL response time in Network tab |
| **Review Submission**                | <1s (mutation)                    | Time from click to success message   |
| **Product Page Load (with reviews)** | <2s (LCP)                         | Lighthouse audit, Core Web Vitals    |
| **Review Summary Calculation**       | <100ms                            | Database query execution time        |
| **Cache Hit Rate**                   | >80%                              | WordPress object cache stats         |
| **Database Queries per Request**     | <5 queries                        | Query Monitor plugin                 |
| **Memory Usage**                     | <128MB per request                | PHP memory profiling                 |

#### Performance Monitoring Setup

**WordPress Query Monitor Plugin Integration**:

```php
// Add custom query markers for debugging
class MEBL_Review_Performance_Monitor {

    public static function track_query($query_name, $callback) {
        if (defined('QM_ENABLED') && QM_ENABLED) {
            do_action('qm/start', "mebl_review_{$query_name}");
        }

        $start_time = microtime(true);
        $result = $callback();
        $execution_time = microtime(true) - $start_time;

        if (defined('QM_ENABLED') && QM_ENABLED) {
            do_action('qm/stop', "mebl_review_{$query_name}");
        }

        // Log slow operations
        if ($execution_time > 0.5) {
            error_log(sprintf(
                '[MEBL Reviews] Slow operation: %s took %.4fs',
                $query_name,
                $execution_time
            ));
        }

        return $result;
    }
}

// Usage in resolvers
public function resolve_product_reviews($product) {
    return MEBL_Review_Performance_Monitor::track_query('product_reviews', function() use ($product) {
        return MEBL_Review_Query_Optimizer::get_paginated_reviews($product->databaseId, 1, 10);
    });
}
```

**Frontend Performance Monitoring**:

```typescript
// src/utils/functions/performanceMonitor.ts
export function trackGraphQLTiming(operationName: string, duration: number) {
  // Send to analytics (Google Analytics, Plausible, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'graphql_timing', {
      event_category: 'performance',
      event_label: operationName,
      value: Math.round(duration),
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GraphQL] ${operationName} took ${duration}ms`);
  }

  // Alert on slow queries
  if (duration > 1000) {
    console.warn(
      `[GraphQL] Slow query detected: ${operationName} (${duration}ms)`,
    );
  }
}

// Integrate with Apollo Client
import { ApolloLink } from '@apollo/client';

const performanceLink = new ApolloLink((operation, forward) => {
  const startTime = Date.now();

  return forward(operation).map((response) => {
    const duration = Date.now() - startTime;
    trackGraphQLTiming(operation.operationName, duration);
    return response;
  });
});

// Add to Apollo Client link chain
const client = new ApolloClient({
  link: ApolloLink.from([performanceLink, authLink, httpLink]),
  cache,
});
```

---

### 7.5 Scalability Considerations

#### Horizontal Scaling Patterns

**Database Read Replicas** (for high-traffic scenarios):

```php
// Configure WordPress to use read replicas for review queries
// Add to wp-config.php:
define('DB_REPLICA_HOST', 'replica.wordpress2533583.home.pl');
define('DB_REPLICA_USER', 'replica_user');
define('DB_REPLICA_PASSWORD', 'replica_password');

// In plugin code, use replica for read-only queries:
class MEBL_Review_Database {

    private static function get_read_connection() {
        if (defined('DB_REPLICA_HOST')) {
            static $replica_db = null;

            if (null === $replica_db) {
                $replica_db = new wpdb(
                    DB_REPLICA_USER,
                    DB_REPLICA_PASSWORD,
                    DB_NAME,
                    DB_REPLICA_HOST
                );
            }

            return $replica_db;
        }

        global $wpdb;
        return $wpdb; // Fallback to primary
    }

    public static function query_reviews($product_id) {
        $db = self::get_read_connection();

        // Execute read-only query on replica
        return $db->get_results(/* query */);
    }
}
```

#### Sharding Strategy (Future-Proofing)

For multi-store or international deployments:

```php
// Route reviews to regional databases based on product origin
class MEBL_Review_Sharding {

    public static function get_shard_for_product($product_id) {
        $product = wc_get_product($product_id);
        $store_region = get_post_meta($product_id, '_store_region', true);

        return match($store_region) {
            'EU' => 'eu_shard',
            'US' => 'us_shard',
            'ASIA' => 'asia_shard',
            default => 'default_shard'
        };
    }

    public static function get_database_for_shard($shard) {
        $shard_config = [
            'eu_shard' => ['host' => 'eu-db.example.com', 'name' => 'reviews_eu'],
            'us_shard' => ['host' => 'us-db.example.com', 'name' => 'reviews_us'],
            'asia_shard' => ['host' => 'asia-db.example.com', 'name' => 'reviews_asia'],
            'default_shard' => ['host' => DB_HOST, 'name' => DB_NAME],
        ];

        return $shard_config[$shard] ?? $shard_config['default_shard'];
    }
}
```

#### Auto-Scaling Triggers

Define scaling thresholds for infrastructure monitoring:

```yaml
# Example scaling policy (for cloud hosting like AWS/GCP)
scaling_policy:
  metrics:
    - name: review_query_latency
      threshold: 500ms
      duration: 5m
      action: scale_up_read_replicas

    - name: review_submission_rate
      threshold: 100_requests_per_minute
      duration: 10m
      action: scale_up_app_servers

    - name: database_cpu_usage
      threshold: 75%
      duration: 5m
      action: scale_up_database_tier

  limits:
    max_read_replicas: 5
    max_app_servers: 10
    max_database_tier: db.r5.4xlarge
```

#### Queue-Based Review Processing (Phase 2)

For asynchronous processing of review submissions:

```php
// Offload review validation/spam-check to background queue
class MEBL_Review_Queue {

    public static function enqueue_review($review_data) {
        // Use WordPress cron or external queue (Redis Queue, AWS SQS)
        wp_schedule_single_event(time(), 'mebl_process_review', [$review_data]);
    }

    public static function process_review($review_data) {
        // Step 1: Spam check (Antispam Bee)
        $is_spam = self::check_spam($review_data);

        // Step 2: Toxicity analysis (if enabled)
        $toxicity_score = self::analyze_toxicity($review_data['content']);

        // Step 3: Auto-approve or hold for moderation
        $approval_status = ($is_spam || $toxicity_score > 0.8) ? 'hold' : 'approve';

        // Step 4: Insert review
        wp_insert_comment([
            'comment_post_ID' => $review_data['product_id'],
            'comment_author' => $review_data['author_name'],
            'comment_content' => $review_data['content'],
            'comment_type' => 'review',
            'comment_approved' => $approval_status,
            'user_id' => $review_data['user_id'],
        ]);

        // Step 5: Invalidate caches
        MEBL_Review_Cache::invalidate_product($review_data['product_id']);
    }
}

add_action('mebl_process_review', [MEBL_Review_Queue::class, 'process_review']);
```

**GraphQL Mutation Returns Immediate Acknowledgment**:

```graphql
mutation SubmitReview($input: SubmitReviewInput!) {
  submitReview(input: $input) {
    success
    status # "pending", "approved", "processing"
    message # "Review submitted and will appear after moderation"
  }
}
```

---

### 7.6 Observability and Monitoring

#### Logging Strategy

**Structured Logging for Review Events**:

```php
class MEBL_Review_Logger {

    public static function log_event($event_type, $context = []) {
        $log_entry = [
            'timestamp' => current_time('mysql'),
            'event' => $event_type,
            'context' => $context,
            'user_id' => get_current_user_id(),
            'ip_address' => self::get_client_ip(),
        ];

        // Log to WordPress debug.log
        error_log('[MEBL Reviews] ' . wp_json_encode($log_entry));

        // Optional: Send to external logging service (Loggly, Papertrail, etc.)
        if (defined('MEBL_LOG_ENDPOINT')) {
            wp_remote_post(MEBL_LOG_ENDPOINT, [
                'body' => wp_json_encode($log_entry),
                'headers' => ['Content-Type' => 'application/json'],
            ]);
        }
    }

    private static function get_client_ip() {
        return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
}

// Usage in critical code paths
MEBL_Review_Logger::log_event('review_submitted', [
    'product_id' => $product_id,
    'rating' => $rating,
    'verified_purchase' => $is_verified,
]);

MEBL_Review_Logger::log_event('review_spam_detected', [
    'product_id' => $product_id,
    'reason' => 'antispam_bee_flagged',
]);

MEBL_Review_Logger::log_event('review_moderation_approved', [
    'review_id' => $review_id,
    'moderator_id' => get_current_user_id(),
]);
```

#### Metrics Collection

**Key Metrics to Track**:

```php
class MEBL_Review_Metrics {

    // Track daily review submission count
    public static function increment_daily_submissions() {
        $today = date('Y-m-d');
        $key = "mebl_reviews_submitted_{$today}";

        $count = get_transient($key) ?: 0;
        set_transient($key, $count + 1, DAY_IN_SECONDS);
    }

    // Track average review rating trend
    public static function calculate_average_rating_trend() {
        global $wpdb;

        $query = "
            SELECT
                DATE(c.comment_date) as date,
                AVG(CAST(cm.meta_value AS DECIMAL(3,2))) as avg_rating,
                COUNT(*) as review_count
            FROM {$wpdb->comments} c
            INNER JOIN {$wpdb->commentmeta} cm
                ON c.comment_ID = cm.comment_id AND cm.meta_key = 'rating'
            WHERE c.comment_type = 'review'
                AND c.comment_approved = '1'
                AND c.comment_date > DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(c.comment_date)
            ORDER BY date ASC
        ";

        return $wpdb->get_results($query, ARRAY_A);
    }

    // Track cache hit rate
    public static function track_cache_hit($cache_key, $is_hit) {
        $total_key = 'mebl_cache_total';
        $hit_key = 'mebl_cache_hits';

        $total = (int) get_transient($total_key);
        $hits = (int) get_transient($hit_key);

        $total++;
        if ($is_hit) {
            $hits++;
        }

        set_transient($total_key, $total, HOUR_IN_SECONDS);
        set_transient($hit_key, $hits, HOUR_IN_SECONDS);
    }

    public static function get_cache_hit_rate() {
        $total = (int) get_transient('mebl_cache_total');
        $hits = (int) get_transient('mebl_cache_hits');

        return $total > 0 ? ($hits / $total) * 100 : 0;
    }
}
```

#### Health Check Endpoint

Add health check for monitoring systems:

```php
// Register GraphQL health check query
add_action('graphql_register_types', function() {
    register_graphql_field('RootQuery', 'reviewSystemHealth', [
        'type' => 'ReviewSystemHealth',
        'description' => 'Health check for review system',
        'resolve' => function() {
            global $wpdb;

            // Check database connectivity
            $db_healthy = (bool) $wpdb->get_var("SELECT 1");

            // Check cache connectivity
            $cache_healthy = wp_cache_set('mebl_health_check', true, 'mebl_reviews', 10);

            // Get recent review count
            $recent_reviews = $wpdb->get_var("
                SELECT COUNT(*)
                FROM {$wpdb->comments}
                WHERE comment_type = 'review'
                    AND comment_date > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ");

            return [
                'status' => ($db_healthy && $cache_healthy) ? 'healthy' : 'degraded',
                'databaseConnected' => $db_healthy,
                'cacheConnected' => $cache_healthy,
                'recentReviewCount' => (int) $recent_reviews,
                'cacheHitRate' => MEBL_Review_Metrics::get_cache_hit_rate(),
                'timestamp' => current_time('mysql'),
            ];
        }
    ]);

    register_graphql_object_type('ReviewSystemHealth', [
        'fields' => [
            'status' => ['type' => 'String'],
            'databaseConnected' => ['type' => 'Boolean'],
            'cacheConnected' => ['type' => 'Boolean'],
            'recentReviewCount' => ['type' => 'Int'],
            'cacheHitRate' => ['type' => 'Float'],
            'timestamp' => ['type' => 'String'],
        ]
    ]);
});
```

**Frontend Monitoring**:

```typescript
// src/utils/functions/healthCheck.ts
export async function checkReviewSystemHealth() {
  const query = `
    query ReviewSystemHealth {
      reviewSystemHealth {
        status
        databaseConnected
        cacheConnected
        recentReviewCount
        cacheHitRate
        timestamp
      }
    }
  `;

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();
    return data.reviewSystemHealth;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy' };
  }
}
```

#### Alerting Rules

Define alerting thresholds for production monitoring:

```yaml
# Example alerting configuration (for services like PagerDuty, Opsgenie)
alerts:
  - name: high_review_submission_failure_rate
    condition: error_rate > 5%
    window: 5m
    severity: warning
    action: notify_team

  - name: review_query_latency_high
    condition: p95_latency > 1000ms
    window: 10m
    severity: critical
    action: page_on_call

  - name: database_connection_failure
    condition: db_health_check_fails > 3
    window: 1m
    severity: critical
    action: page_on_call

  - name: cache_hit_rate_low
    condition: cache_hit_rate < 50%
    window: 15m
    severity: warning
    action: notify_team

  - name: spam_review_surge
    condition: spam_detected_rate > 20%
    window: 5m
    severity: warning
    action: notify_moderation_team
```

---

**End of Part 7**

✅ Database query optimization (indexing, optimized queries, batch fetching, query monitoring)  
✅ Caching strategy (WordPress object cache, transients, Apollo cache, cache warming)  
✅ CDN and static asset optimization (static JSON exports, cache headers)  
✅ Load testing and performance benchmarks (Apache Bench, Playwright tests, target metrics, monitoring setup)  
✅ Scalability considerations (read replicas, sharding, auto-scaling, queue-based processing)  
✅ Observability and monitoring (logging, metrics collection, health checks, alerting)

---
