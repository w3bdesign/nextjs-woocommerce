## 8. Rollout Strategy, Migration, and Future Extensibility

### 8.1 Phased Rollout Plan

**Goal**: Minimize risk during deployment through incremental feature rollout with validation gates between phases.

#### Phase 0: Pre-Deployment Preparation (Week 1)

**Backend Setup**:

```bash
# 1. Backup WordPress database before plugin installation
ssh wordpress2533583.home.pl
cd /path/to/wordpress
wp db export backup-pre-reviews-$(date +%Y%m%d).sql

# 2. Enable WordPress debug mode for staging
# Add to wp-config.php:
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

# 3. Upload plugin via FTP or WordPress admin
# wordpress/mebl-review-bridge/ → /wp-content/plugins/mebl-review-bridge/

# 4. Activate plugin
wp plugin activate mebl-review-bridge

# 5. Verify database indexes created
wp db query "SHOW INDEX FROM wp_comments WHERE Key_name LIKE 'idx_%';"
```

**Frontend Preparation**:

```bash
# 1. Create feature branch
git checkout -b feature/review-system

# 2. Install dependencies (if any new packages needed)
npm install

# 3. Run type checking
npm run type-check

# 4. Run linting
npm run lint

# 5. Build production bundle
npm run build

# 6. Test build locally
npm run start
```

**Pre-Flight Checklist**:

- [ ] WordPress plugin uploaded and activated
- [ ] Database indexes created successfully
- [ ] GraphQL schema extended (verify in GraphiQL)
- [ ] Frontend components built without errors
- [ ] Environment variables configured (`NEXT_PUBLIC_GRAPHQL_URL`)
- [ ] Staging environment available for testing
- [ ] Rollback plan documented
- [ ] Team notified of deployment schedule

---

#### Phase 1: Dark Launch (Week 2 - Backend Only)

**Objective**: Deploy backend infrastructure without exposing frontend UI. Validate GraphQL API functionality.

**Backend Deployment**:

```php
// Enable review system but keep frontend hidden
// Add to wp-config.php or plugin settings:
define('MEBL_REVIEWS_ENABLED', true);
define('MEBL_REVIEWS_FRONTEND_VISIBLE', false); // Feature flag
```

**Testing Procedures**:

```bash
# Test GraphQL queries via GraphiQL (https://wordpress2533583.home.pl/graphql)

# Query 1: Product reviews (should return empty array initially)
query GetProductReviews {
  product(id: 123, idType: DATABASE_ID) {
    databaseId
    name
    reviews(first: 10) {
      edges {
        node {
          databaseId
          content
          rating
        }
      }
    }
    reviewSummary {
      averageRating
      totalReviews
    }
  }
}

# Query 2: Health check
query HealthCheck {
  reviewSystemHealth {
    status
    databaseConnected
    cacheConnected
  }
}

# Mutation 1: Submit test review (authenticated user required)
mutation SubmitTestReview {
  submitReview(input: {
    productId: 123
    rating: 5
    title: "Test Review"
    content: "This is a test review for validation."
    authorName: "Test User"
    authorEmail: "test@example.com"
  }) {
    success
    message
    review {
      databaseId
      content
    }
  }
}
```

**Validation Criteria**:

- [ ] GraphQL queries return expected schema structure
- [ ] Health check reports `status: "healthy"`
- [ ] Test review submission succeeds
- [ ] Review appears in WordPress admin (`Comments > Reviews`)
- [ ] Cached data updates after review approval
- [ ] No PHP errors in `wp-content/debug.log`
- [ ] GraphQL response times <500ms (uncached)

**Rollback Trigger**: Any validation failure, PHP fatal errors, or database corruption.

---

#### Phase 2: Internal Beta (Week 3 - Limited Frontend Visibility)

**Objective**: Enable review UI for internal team and selected beta users for feedback.

**Feature Flag Implementation**:

```typescript
// src/utils/featureFlags.ts
export const FEATURE_FLAGS = {
  REVIEWS_ENABLED: process.env.NEXT_PUBLIC_REVIEWS_ENABLED === 'true',
  REVIEWS_BETA_USERS:
    process.env.NEXT_PUBLIC_REVIEWS_BETA_USERS?.split(',') || [],
};

export function isReviewsEnabledForUser(userId?: string): boolean {
  if (!FEATURE_FLAGS.REVIEWS_ENABLED) {
    return false;
  }

  // If beta user list is empty, enable for all
  if (FEATURE_FLAGS.REVIEWS_BETA_USERS.length === 0) {
    return true;
  }

  // Check if user is in beta list
  return userId ? FEATURE_FLAGS.REVIEWS_BETA_USERS.includes(userId) : false;
}
```

**Conditional Component Rendering**:

```typescript
// src/pages/product/[slug].tsx
import { isReviewsEnabledForUser } from '@/utils/featureFlags';
import { ProductReviews } from '@/components/Product/ProductReviews.component';

export default function ProductPage({ product, reviews, user }) {
  const showReviews = isReviewsEnabledForUser(user?.id);

  return (
    <div>
      <ProductDetails product={product} />
      <ProductConfigurator product={product} />

      {showReviews && (
        <ProductReviews
          productId={product.databaseId}
          initialReviews={reviews}
        />
      )}
    </div>
  );
}
```

**Environment Configuration**:

```bash
# .env.local (for staging/beta environment)
NEXT_PUBLIC_REVIEWS_ENABLED=true
NEXT_PUBLIC_REVIEWS_BETA_USERS=admin,user123,user456

# Deploy to staging
npm run build
npm run start
```

**Beta Testing Feedback Loop**:

1. **Collect Feedback**: Provide beta users with feedback form
2. **Monitor Metrics**: Track review submissions, errors, performance
3. **Iterate**: Fix bugs, adjust UI based on feedback
4. **Duration**: 1 week minimum, extend if critical issues found

**Validation Criteria**:

- [ ] Beta users can view review section on product pages
- [ ] Beta users can submit reviews successfully
- [ ] Review form validation works correctly
- [ ] Star ratings display properly
- [ ] SSR renders reviews correctly (no hydration errors)
- [ ] Accessibility tested with screen readers
- [ ] Mobile responsiveness verified
- [ ] No JavaScript console errors
- [ ] Positive feedback from >80% of beta users

---

#### Phase 3: Gradual Rollout (Week 4-5 - Percentage-Based Traffic)

**Objective**: Incrementally expose review system to production traffic using percentage-based feature flags.

**Progressive Rollout Schedule**:

| Day    | Traffic % | User Segment    | Monitoring Focus              |
| ------ | --------- | --------------- | ----------------------------- |
| Day 1  | 5%        | Random sampling | Error rates, performance      |
| Day 3  | 10%       | Random sampling | User engagement, submissions  |
| Day 5  | 25%       | Random sampling | Database load, cache hit rate |
| Day 7  | 50%       | Random sampling | GraphQL latency, CDN cache    |
| Day 10 | 75%       | Random sampling | Overall stability             |
| Day 14 | 100%      | All users       | Full monitoring suite         |

**Percentage-Based Feature Flag**:

```typescript
// src/utils/featureFlags.ts
export function isReviewsEnabledForUser(userId?: string): boolean {
  if (!FEATURE_FLAGS.REVIEWS_ENABLED) {
    return false;
  }

  const rolloutPercentage = parseInt(
    process.env.NEXT_PUBLIC_REVIEWS_ROLLOUT_PERCENTAGE || '100',
    10,
  );

  // Use deterministic hash of user ID for consistent experience
  if (userId) {
    const hash = userId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bucket = hash % 100;
    return bucket < rolloutPercentage;
  }

  // For anonymous users, use random sampling
  return Math.random() * 100 < rolloutPercentage;
}
```

**Environment Configuration per Stage**:

```bash
# Day 1: 5% rollout
NEXT_PUBLIC_REVIEWS_ENABLED=true
NEXT_PUBLIC_REVIEWS_ROLLOUT_PERCENTAGE=5

# Day 3: 10% rollout
NEXT_PUBLIC_REVIEWS_ROLLOUT_PERCENTAGE=10

# Day 14: Full rollout
NEXT_PUBLIC_REVIEWS_ROLLOUT_PERCENTAGE=100
```

**Monitoring During Rollout**:

```bash
# Monitor GraphQL error rates
grep "SubmitReview" /var/log/graphql.log | grep "error" | wc -l

# Monitor review submission rate
wp db query "SELECT COUNT(*) FROM wp_comments WHERE comment_type='review' AND comment_date > DATE_SUB(NOW(), INTERVAL 1 HOUR);"

# Monitor server CPU/memory
htop

# Monitor Next.js errors (frontend)
# Check Vercel/hosting platform logs for 500 errors
```

**Rollback Criteria**:

- Error rate >5% for review submissions
- GraphQL latency >2s (p95)
- Database CPU usage >90% sustained
- Negative user feedback spike
- Critical bugs discovered

**Rollback Procedure**:

```bash
# Quick rollback: Set rollout percentage to 0
# Update environment variable:
NEXT_PUBLIC_REVIEWS_ROLLOUT_PERCENTAGE=0

# Redeploy frontend
npm run build
npm run start

# Or disable plugin in WordPress
wp plugin deactivate mebl-review-bridge
```

---

#### Phase 4: Full Production (Week 6+)

**Objective**: Review system fully deployed to 100% of users with ongoing monitoring.

**Post-Launch Activities**:

1. **Remove Feature Flags**: Clean up conditional logic after stable rollout
2. **Documentation Update**: Update README, API docs, contributor guides
3. **Performance Baseline**: Establish performance benchmarks for future comparisons
4. **User Communication**: Announce feature to users via email/blog post
5. **SEO Indexing**: Submit updated sitemap with review structured data

**Production Monitoring Dashboard**:

```yaml
# Key metrics to track post-launch
metrics:
  - daily_review_submissions
  - average_rating_per_product
  - spam_detection_rate
  - moderation_queue_size
  - review_approval_latency
  - cache_hit_rate
  - graphql_query_latency
  - database_query_count
  - error_rate_5xx
  - user_engagement_rate (views with reviews vs without)
```

**Success Criteria (After 30 Days)**:

- [ ] > 1000 reviews submitted
- [ ] Average rating >4.0 stars
- [ ] Spam detection rate <10%
- [ ] Error rate <1%
- [ ] Product pages with reviews have >20% higher engagement
- [ ] SEO: Review snippets appearing in Google search results
- [ ] Zero critical bugs reported
- [ ] Positive user sentiment (surveys, feedback forms)

---

### 8.2 Data Migration and Backward Compatibility

#### Scenario 1: Migrating from Third-Party Review System

If migrating from existing review platform (e.g., Yotpo, Judge.me, Trustpilot):

**Migration Script**:

```php
// wordpress/mebl-review-bridge/includes/class-review-importer.php
class MEBL_Review_Importer {

    public static function import_from_csv($csv_file_path) {
        $file = fopen($csv_file_path, 'r');
        $headers = fgetcsv($file); // product_id, author_name, author_email, rating, title, content, date, verified

        $imported = 0;
        $errors = [];

        while (($row = fgetcsv($file)) !== false) {
            $data = array_combine($headers, $row);

            try {
                $comment_id = wp_insert_comment([
                    'comment_post_ID' => (int) $data['product_id'],
                    'comment_author' => sanitize_text_field($data['author_name']),
                    'comment_author_email' => sanitize_email($data['author_email']),
                    'comment_content' => wp_kses_post($data['content']),
                    'comment_type' => 'review',
                    'comment_approved' => '1', // Auto-approve imported reviews
                    'comment_date' => $data['date'],
                    'comment_date_gmt' => get_gmt_from_date($data['date']),
                ]);

                if ($comment_id) {
                    // Add rating
                    add_comment_meta($comment_id, 'rating', floatval($data['rating']));

                    // Add title
                    if (!empty($data['title'])) {
                        add_comment_meta($comment_id, 'review_title', sanitize_text_field($data['title']));
                    }

                    // Add verified purchase flag
                    if (!empty($data['verified']) && $data['verified'] === '1') {
                        add_comment_meta($comment_id, 'verified_purchase', '1');
                    }

                    $imported++;
                } else {
                    $errors[] = "Failed to import review for product {$data['product_id']}";
                }

            } catch (Exception $e) {
                $errors[] = "Error importing review: " . $e->getMessage();
            }
        }

        fclose($file);

        // Update product review counts
        self::recalculate_all_product_summaries();

        return [
            'imported' => $imported,
            'errors' => $errors,
        ];
    }

    private static function recalculate_all_product_summaries() {
        global $wpdb;

        $products_with_reviews = $wpdb->get_col("
            SELECT DISTINCT comment_post_ID
            FROM {$wpdb->comments}
            WHERE comment_type = 'review'
        ");

        foreach ($products_with_reviews as $product_id) {
            MEBL_Review_Cache::invalidate_product($product_id);
            MEBL_Review_Query_Optimizer::get_product_summary($product_id); // Recalculate and cache
        }
    }
}

// WP-CLI command for easy migration
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('mebl import-reviews', function($args) {
        $csv_file = $args[0];

        if (!file_exists($csv_file)) {
            WP_CLI::error("File not found: {$csv_file}");
        }

        WP_CLI::log("Starting import from: {$csv_file}");
        $result = MEBL_Review_Importer::import_from_csv($csv_file);

        WP_CLI::success("Imported {$result['imported']} reviews");

        if (!empty($result['errors'])) {
            WP_CLI::warning("Encountered " . count($result['errors']) . " errors");
            foreach ($result['errors'] as $error) {
                WP_CLI::log("  - {$error}");
            }
        }
    });
}
```

**Usage**:

```bash
# SSH into WordPress server
ssh wordpress2533583.home.pl

# Upload CSV file
# Format: product_id, author_name, author_email, rating, title, content, date, verified

# Run migration via WP-CLI
wp mebl import-reviews /path/to/reviews-export.csv

# Verify import
wp db query "SELECT COUNT(*) FROM wp_comments WHERE comment_type='review';"
```

#### Scenario 2: Backward Compatibility with Existing Systems

**GraphQL Schema Versioning**:

```php
// Support legacy field names for backward compatibility
add_action('graphql_register_types', function() {
    register_graphql_field('Review', 'reviewId', [
        'type' => 'Int',
        'description' => 'Legacy field for backward compatibility',
        'deprecationReason' => 'Use databaseId instead',
        'resolve' => function($review) {
            return $review->databaseId;
        }
    ]);

    register_graphql_field('Review', 'reviewTitle', [
        'type' => 'String',
        'description' => 'Legacy field for backward compatibility',
        'deprecationReason' => 'Use title instead',
        'resolve' => function($review) {
            return $review->title;
        }
    ]);
});
```

**Frontend API Version Support**:

```typescript
// src/utils/gql/GET_PRODUCT_REVIEWS.js
// Support both v1 (legacy) and v2 (current) query formats

export const GET_PRODUCT_REVIEWS_V2 = gql`
  query GetProductReviews($productId: Int!, $first: Int!, $after: String) {
    product(id: $productId, idType: DATABASE_ID) {
      databaseId
      reviews(first: $first, after: $after) {
        edges {
          node {
            databaseId
            title
            content
            rating
            createdAt
            author {
              node {
                name
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_PRODUCT_REVIEWS_V1 = gql`
  query GetProductReviewsLegacy($productId: Int!) {
    product(id: $productId, idType: DATABASE_ID) {
      databaseId
      reviews(first: 100) {
        edges {
          node {
            reviewId # Legacy field
            reviewTitle # Legacy field
            content
            rating
          }
        }
      }
    }
  }
`;

// Use appropriate version based on API version
export const GET_PRODUCT_REVIEWS = GET_PRODUCT_REVIEWS_V2;
```

---

### 8.3 Internationalization (i18n) Readiness

**WordPress Plugin Translation Support**:

```php
// Load plugin text domain for translations
add_action('plugins_loaded', function() {
    load_plugin_textdomain('mebl-review-bridge', false, dirname(plugin_basename(__FILE__)) . '/languages');
});

// Example translatable strings
$submit_button_text = __('Submit Review', 'mebl-review-bridge');
$success_message = __('Thank you! Your review has been submitted.', 'mebl-review-bridge');
$error_message = __('Sorry, there was an error submitting your review.', 'mebl-review-bridge');

// Plural forms
$review_count_text = sprintf(
    _n('%d review', '%d reviews', $count, 'mebl-review-bridge'),
    $count
);
```

**Frontend Internationalization (Next.js)**:

```typescript
// src/locales/en.json
{
  "reviews": {
    "title": "Customer Reviews",
    "averageRating": "Average Rating",
    "writeReview": "Write a Review",
    "sortBy": "Sort by",
    "sortOptions": {
      "newest": "Newest",
      "highest": "Highest Rated",
      "lowest": "Lowest Rated",
      "helpful": "Most Helpful"
    },
    "verifiedPurchase": "Verified Purchase",
    "helpful": "Helpful",
    "reportReview": "Report Review",
    "submitSuccess": "Thank you! Your review has been submitted.",
    "submitError": "Sorry, there was an error. Please try again."
  }
}

// src/locales/pl.json (Polish translation)
{
  "reviews": {
    "title": "Opinie klientów",
    "averageRating": "Średnia ocena",
    "writeReview": "Napisz opinię",
    "sortBy": "Sortuj według",
    "sortOptions": {
      "newest": "Najnowsze",
      "highest": "Najwyżej ocenione",
      "lowest": "Najniżej ocenione",
      "helpful": "Najbardziej pomocne"
    },
    "verifiedPurchase": "Zweryfikowany zakup",
    "helpful": "Pomocne",
    "reportReview": "Zgłoś opinię",
    "submitSuccess": "Dziękujemy! Twoja opinia została wysłana.",
    "submitError": "Przepraszamy, wystąpił błąd. Spróbuj ponownie."
  }
}
```

**Translation Hook in Components**:

```typescript
// src/components/Product/ReviewForm.component.tsx
import { useTranslation } from 'next-i18next';

export const ReviewForm: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <form>
      <h3>{t('reviews.writeReview')}</h3>
      <button type="submit">{t('reviews.submitButton')}</button>
    </form>
  );
};
```

---

### 8.4 Multi-Store Considerations

For businesses operating multiple WooCommerce stores or brands:

#### Shared Review Database Architecture

```php
// Configure multi-store review sharing
class MEBL_Multi_Store_Reviews {

    // Map product SKUs across stores for shared reviews
    public static function get_canonical_product_sku($product_id) {
        $sku = get_post_meta($product_id, '_sku', true);

        // If product has canonical SKU meta, use that
        $canonical_sku = get_post_meta($product_id, '_canonical_sku', true);
        return $canonical_sku ?: $sku;
    }

    // Fetch reviews from multiple stores for same product
    public static function get_cross_store_reviews($product_id) {
        global $wpdb;

        $canonical_sku = self::get_canonical_product_sku($product_id);

        // Get all products with same canonical SKU
        $product_ids = $wpdb->get_col($wpdb->prepare("
            SELECT post_id
            FROM {$wpdb->postmeta}
            WHERE meta_key IN ('_sku', '_canonical_sku')
                AND meta_value = %s
        ", $canonical_sku));

        if (empty($product_ids)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($product_ids), '%d'));

        // Get reviews for all matching products
        $query = $wpdb->prepare("
            SELECT c.*, cm.meta_value as rating
            FROM {$wpdb->comments} c
            INNER JOIN {$wpdb->commentmeta} cm
                ON c.comment_ID = cm.comment_id AND cm.meta_key = 'rating'
            WHERE c.comment_post_ID IN ({$placeholders})
                AND c.comment_approved = '1'
                AND c.comment_type = 'review'
            ORDER BY c.comment_date DESC
        ", ...$product_ids);

        return $wpdb->get_results($query, ARRAY_A);
    }
}
```

#### Store-Specific Configuration

```php
// Define store-specific review settings
class MEBL_Store_Config {

    public static function get_store_id() {
        // Detect store based on domain or site ID (multisite)
        if (is_multisite()) {
            return get_current_blog_id();
        }

        return defined('MEBL_STORE_ID') ? MEBL_STORE_ID : 'default';
    }

    public static function get_review_settings() {
        $store_id = self::get_store_id();

        $settings = [
            'store_1' => [
                'auto_approve_verified' => true,
                'require_purchase' => true,
                'moderate_low_ratings' => false,
            ],
            'store_2' => [
                'auto_approve_verified' => false,
                'require_purchase' => false,
                'moderate_low_ratings' => true,
            ],
            'default' => [
                'auto_approve_verified' => true,
                'require_purchase' => true,
                'moderate_low_ratings' => false,
            ],
        ];

        return $settings[$store_id] ?? $settings['default'];
    }
}
```

---

### 8.5 Future Extensibility

#### Phase 2 Feature Roadmap

**Priority 1: Enhanced Review Features** (Q1 2026)

1. **Review Photos/Videos**
   - Allow users to upload images/videos with reviews
   - Store in WordPress media library
   - Display in gallery format
   - Image optimization and CDN delivery

2. **Review Helpfulness Voting**
   - "Was this helpful?" buttons (Yes/No)
   - Track helpful_count in commentmeta
   - Sort reviews by helpfulness
   - Prevent vote manipulation (IP tracking)

3. **Review Responses**
   - Allow store owners to respond to reviews
   - Display responses inline with reviews
   - Email notification to reviewer when response posted

4. **Advanced Filtering**
   - Filter by star rating (show only 5-star, 4-star, etc.)
   - Filter by verified purchases only
   - Filter by review date range
   - Filter by reviewer attributes (e.g., "tall users")

**Priority 2: AI-Powered Features** (Q2 2026)

1. **AI Review Summarization**
   - Use GPT-4/Claude to generate review summaries
   - "Customers love: [key positive points]"
   - "Areas for improvement: [key negative points]"
   - Update summary on new review approval

2. **Sentiment Analysis**
   - Classify reviews as positive/neutral/negative
   - Extract product aspects mentioned (quality, price, shipping)
   - Display sentiment breakdown in dashboard

3. **Automated Review Solicitation**
   - Send review request emails X days after delivery
   - Personalized email templates
   - Track email open/click rates
   - A/B test email timing and content

**Priority 3: Analytics and Insights** (Q3 2026)

1. **Review Analytics Dashboard**
   - Review trends over time (charts)
   - Average rating by product category
   - Review velocity (reviews per week)
   - Conversion rate impact (products with reviews vs without)

2. **Competitor Benchmarking**
   - Compare average ratings to industry benchmarks
   - Track rating improvements over time
   - Alert on rating drops

3. **Review-Driven Product Improvements**
   - Extract common complaints from negative reviews
   - Prioritize product issues based on review mentions
   - Track issue resolution and rating improvements

#### Extensibility Architecture

**Plugin System for Review Extensions**:

```php
// Allow third-party extensions to hook into review system
class MEBL_Review_Extension_API {

    // Hook for processing review before save
    public static function before_review_save($review_data) {
        return apply_filters('mebl_before_review_save', $review_data);
    }

    // Hook for processing review after approval
    public static function after_review_approved($review_id) {
        do_action('mebl_after_review_approved', $review_id);
    }

    // Hook for custom review rendering
    public static function render_review_extra_fields($review) {
        do_action('mebl_render_review_extras', $review);
    }
}

// Example extension: Add review photos
add_filter('mebl_before_review_save', function($review_data) {
    if (!empty($_FILES['review_photos'])) {
        $review_data['photos'] = handle_review_photo_upload($_FILES['review_photos']);
    }
    return $review_data;
});

add_action('mebl_render_review_extras', function($review) {
    $photos = get_comment_meta($review->comment_ID, 'review_photos', true);
    if ($photos) {
        echo '<div class="review-photos">';
        foreach ($photos as $photo) {
            echo '<img src="' . esc_url($photo) . '" alt="Review photo" />';
        }
        echo '</div>';
    }
});
```

**GraphQL Schema Extension Pattern**:

```php
// Allow extensions to add custom GraphQL fields
add_action('graphql_register_types', function() {
    // Register interface for extensible review fields
    register_graphql_interface_type('ReviewExtension', [
        'description' => 'Interface for custom review extensions',
        'fields' => [
            'extensionName' => ['type' => 'String'],
            'extensionData' => ['type' => 'String'], // JSON encoded
        ],
    ]);

    // Allow third-party plugins to register custom fields
    do_action('mebl_register_review_extensions');
});

// Example: Photo extension
add_action('mebl_register_review_extensions', function() {
    register_graphql_field('Review', 'photos', [
        'type' => ['list_of' => 'String'],
        'description' => 'Photo URLs attached to review',
        'resolve' => function($review) {
            return get_comment_meta($review->comment_ID, 'review_photos', true) ?: [];
        }
    ]);
});
```

---

### 8.6 API Versioning Strategy

**GraphQL API Version Management**:

```php
// Support multiple API versions simultaneously
class MEBL_Review_API_Versioning {

    public static function init() {
        // Register v1 and v2 endpoints
        add_action('graphql_register_types', [__CLASS__, 'register_v1_types'], 10);
        add_action('graphql_register_types', [__CLASS__, 'register_v2_types'], 20);
    }

    public static function register_v1_types() {
        // Legacy API structure (deprecated)
        register_graphql_field('Product', 'reviewsV1', [
            'type' => ['list_of' => 'ReviewV1'],
            'deprecationReason' => 'Use reviews field instead (v2)',
            'resolve' => function($product) {
                // Return old format for backward compatibility
                return self::get_reviews_v1_format($product->databaseId);
            }
        ]);
    }

    public static function register_v2_types() {
        // Current API structure with pagination and enhanced fields
        register_graphql_field('Product', 'reviews', [
            'type' => 'ProductToReviewConnection',
            'args' => [
                'first' => ['type' => 'Int', 'defaultValue' => 10],
                'after' => ['type' => 'String'],
                'sortBy' => ['type' => 'ReviewSortEnum'],
            ],
            'resolve' => function($product, $args) {
                return self::get_reviews_v2_format($product->databaseId, $args);
            }
        ]);
    }
}
```

**Version Deprecation Timeline**:

```yaml
# API version lifecycle policy
v1:
  released: 2025-12-01
  deprecated: 2026-06-01
  sunset: 2027-01-01
  status: deprecated

v2:
  released: 2026-06-01
  deprecated: null
  sunset: null
  status: current

v3:
  released: null
  deprecated: null
  sunset: null
  status: planned
```

**Client Migration Guide**:

```typescript
// src/docs/API_MIGRATION_V1_TO_V2.md

/**
 * Migration Guide: Reviews API v1 → v2
 *
 * Breaking Changes:
 * 1. Review field renamed: `reviewId` → `databaseId`
 * 2. Review field renamed: `reviewTitle` → `title`
 * 3. Pagination changed from offset to cursor-based
 * 4. Date format changed from Unix timestamp to ISO 8601
 *
 * Migration Steps:
 * 1. Update GraphQL queries to use new field names
 * 2. Implement cursor-based pagination logic
 * 3. Update date parsing to handle ISO format
 * 4. Test thoroughly in staging environment
 * 5. Deploy with feature flag for gradual rollout
 */

// Old v1 query
const OLD_QUERY = gql`
  query GetReviews($productId: Int!) {
    product(id: $productId) {
      reviewsV1 {
        reviewId
        reviewTitle
        content
        rating
        timestamp
      }
    }
  }
`;

// New v2 query
const NEW_QUERY = gql`
  query GetReviews($productId: Int!, $first: Int!, $after: String) {
    product(id: $productId, idType: DATABASE_ID) {
      reviews(first: $first, after: $after) {
        edges {
          node {
            databaseId
            title
            content
            rating
            createdAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
```

---

### 8.7 Long-Term Maintenance Plan

#### Code Ownership and Documentation

**Maintainer Responsibilities**:

```yaml
# CODEOWNERS file
# Review system ownership structure

# WordPress Plugin
wordpress/mebl-review-bridge/**       @backend-team @lead-developer

# GraphQL Schema
wordpress/mebl-review-bridge/includes/class-graphql-*.php  @graphql-team

# Frontend Components
src/components/Product/Review*.tsx    @frontend-team
src/components/Product/StarRating.tsx @frontend-team

# Performance and Caching
wordpress/mebl-review-bridge/includes/class-*-cache.php    @performance-team
src/utils/apollo/cache-config.ts      @performance-team

# Security and Moderation
wordpress/mebl-review-bridge/includes/class-review-moderation.php  @security-team

# Tests
src/tests/Reviews/**                  @qa-team
```

**Documentation Maintenance**:

- Update this implementation plan quarterly
- Document all breaking changes in CHANGELOG.md
- Maintain API reference docs in sync with schema
- Update troubleshooting guide based on support tickets
- Record architectural decisions in ADR (Architecture Decision Records)

#### Dependency Management

```json
// package.json - Review system dependencies with version constraints
{
  "dependencies": {
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0",
    "react": "^18.2.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

**Automated Dependency Updates**:

```yaml
# renovate.json - Automated dependency updates
{
  'extends': ['config:base'],
  'packageRules':
    [
      {
        'matchPackagePatterns': ['@apollo/client', 'graphql'],
        'groupName': 'GraphQL dependencies',
        'schedule': ['before 9am on Monday'],
      },
      {
        'matchPackagePatterns': ['react', 'react-dom'],
        'groupName': 'React dependencies',
        'schedule': ['before 9am on Monday'],
      },
    ],
}
```

#### Security Maintenance

**Security Audit Schedule**:

```yaml
security_audits:
  - type: dependency_scan
    frequency: weekly
    tool: npm audit
    action: auto_create_pr_for_high_severity

  - type: code_scan
    frequency: monthly
    tool: SonarQube
    action: report_to_security_team

  - type: penetration_test
    frequency: quarterly
    vendor: external_security_firm
    scope: review_submission_xss_csrf_sql_injection

  - type: wordpress_plugin_review
    frequency: before_each_major_release
    checklist: wordpress.org_plugin_review_guidelines
```

**Security Patch Procedure**:

1. **Detection**: Vulnerability reported via security email or automated scan
2. **Assessment**: Evaluate severity (critical/high/medium/low) and impact
3. **Patching**: Develop and test fix in isolated branch
4. **Testing**: Run full test suite + security-specific tests
5. **Deployment**: Deploy to production with priority based on severity
   - Critical: Within 24 hours
   - High: Within 1 week
   - Medium: Within 1 month
   - Low: Next regular release
6. **Disclosure**: Publish security advisory after patch deployed

---

### 8.8 Success Metrics and KPIs

**Review System Health Metrics**:

```yaml
kpis:
  engagement:
    - metric: review_submission_rate
      target: '>5% of completed orders'
      measurement: 'reviews_submitted / orders_completed * 100'

    - metric: review_view_rate
      target: '>80% of product page visitors view reviews'
      measurement: 'product_page_views_with_review_interaction / total_product_page_views * 100'

  quality:
    - metric: average_rating
      target: '4.0 - 4.5 stars'
      measurement: 'AVG(rating) across all approved reviews'

    - metric: verified_purchase_ratio
      target: '>60% of reviews from verified buyers'
      measurement: 'verified_reviews / total_reviews * 100'

  moderation:
    - metric: spam_detection_rate
      target: '<10% of submissions flagged as spam'
      measurement: 'spam_reviews / total_submissions * 100'

    - metric: moderation_latency
      target: '<24 hours for manual review'
      measurement: 'AVG(approval_time - submission_time)'

  performance:
    - metric: graphql_query_latency_p95
      target: '<500ms'
      measurement: '95th percentile GraphQL response time'

    - metric: cache_hit_rate
      target: '>80%'
      measurement: 'cache_hits / total_requests * 100'

  business_impact:
    - metric: conversion_rate_lift
      target: '+10% for products with reviews'
      measurement: 'conversion_rate_with_reviews / conversion_rate_without_reviews - 1'

    - metric: seo_visibility
      target: 'Review snippets in 90% of product SERPs'
      measurement: 'products_with_rich_snippets / total_products_in_google * 100'
```

**Quarterly Review Checklist**:

- [ ] Review KPIs against targets
- [ ] Analyze user feedback and feature requests
- [ ] Assess technical debt and refactoring needs
- [ ] Update roadmap based on business priorities
- [ ] Audit security and privacy compliance
- [ ] Review and update documentation
- [ ] Plan next quarter's improvements

---

**End of Part 8 (FINAL)**

✅ Phased rollout plan (dark launch → beta → gradual → full production)  
✅ Data migration procedures (CSV import, backward compatibility)  
✅ Internationalization readiness (WordPress + Next.js i18n)  
✅ Multi-store considerations (shared reviews, store-specific config)  
✅ Future extensibility (Phase 2 roadmap, plugin system, AI features)  
✅ API versioning strategy (v1 deprecation, v2 current, migration guide)  
✅ Long-term maintenance plan (code ownership, dependency management, security)  
✅ Success metrics and KPIs (engagement, quality, performance, business impact)

---
