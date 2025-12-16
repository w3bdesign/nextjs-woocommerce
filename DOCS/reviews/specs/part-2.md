## Part 2: Data Model and Ownership

### 2.1 WordPress Database Schema

**Primary Tables (Existing WordPress/WooCommerce Infrastructure):**

#### `wp_comments` — Core Review Storage

```sql
CREATE TABLE wp_comments (
  comment_ID bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  comment_post_ID bigint(20) UNSIGNED NOT NULL DEFAULT 0,    -- Foreign key to wp_posts.ID (product)
  comment_author tinytext NOT NULL,                          -- Reviewer display name
  comment_author_email varchar(100) NOT NULL DEFAULT '',     -- Email for verification
  comment_author_url varchar(200) NOT NULL DEFAULT '',       -- Not used for reviews
  comment_author_IP varchar(100) NOT NULL DEFAULT '',        -- Spam prevention
  comment_date datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  comment_date_gmt datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  comment_content text NOT NULL,                             -- Review text
  comment_karma int(11) NOT NULL DEFAULT 0,                  -- Not used
  comment_approved varchar(20) NOT NULL DEFAULT '1',         -- '0'=pending, '1'=approved, 'spam'=spam
  comment_agent varchar(255) NOT NULL DEFAULT '',            -- User agent string
  comment_type varchar(20) NOT NULL DEFAULT 'comment',       -- Set to 'review' for product reviews
  comment_parent bigint(20) UNSIGNED NOT NULL DEFAULT 0,     -- For seller responses (threaded)
  user_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,            -- Foreign key to wp_users.ID

  PRIMARY KEY (comment_ID),
  KEY comment_post_ID (comment_post_ID),
  KEY comment_approved_date_gmt (comment_approved, comment_date_gmt),
  KEY comment_date_gmt (comment_date_gmt),
  KEY comment_parent (comment_parent),
  KEY comment_author_email (comment_author_email(10)),
  KEY user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
```

**Key Fields for Reviews:**

- `comment_type = 'review'` — Distinguishes reviews from blog comments
- `comment_approved` — Moderation status: `'0'` (pending), `'1'` (approved), `'spam'`, `'trash'`
- `comment_post_ID` — Links to product (`wp_posts` where `post_type = 'product'`)
- `user_id` — Links to authenticated user (required for verified purchase check)

#### `wp_commentmeta` — Review Metadata Storage

```sql
CREATE TABLE wp_commentmeta (
  meta_id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  comment_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  meta_key varchar(255) DEFAULT NULL,
  meta_value longtext DEFAULT NULL,

  PRIMARY KEY (meta_id),
  KEY comment_id (comment_id),
  KEY meta_key (meta_key(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
```

**Review-Specific Meta Keys:**

| Meta Key         | Type    | Description                               | Example              |
| ---------------- | ------- | ----------------------------------------- | -------------------- |
| `rating`         | INT     | 1-5 star rating                           | `5`                  |
| `verified`       | VARCHAR | Verified purchase flag                    | `'1'` or `'0'`       |
| `helpful`        | INT     | Upvote count (Phase 2)                    | `12`                 |
| `reported`       | VARCHAR | User-reported flag (Phase 2)              | `'1'` or `'0'`       |
| `admin_response` | TEXT    | Store admin response separately (Phase 2) | `"Thank you for..."` |

#### `wp_posts` — Product Reference

```sql
-- Relevant fields only (table already exists)
SELECT ID, post_title, post_type, comment_status, comment_count
FROM wp_posts
WHERE post_type = 'product';
```

**Key Fields:**

- `comment_status` — `'open'` or `'closed'` (controls whether reviews allowed)
- `comment_count` — Cached count of approved reviews (updated by WordPress core)

#### `wp_postmeta` — Cached Review Aggregates

```sql
-- Stored in existing wp_postmeta table
SELECT post_id, meta_key, meta_value
FROM wp_postmeta
WHERE meta_key IN ('_wc_average_rating', '_wc_review_count', '_wc_rating_histogram');
```

**Cache Meta Keys:**

| Meta Key               | Type  | Purpose                  | Update Trigger              |
| ---------------------- | ----- | ------------------------ | --------------------------- |
| `_wc_average_rating`   | FLOAT | Average rating (1.0-5.0) | New review approved/deleted |
| `_wc_review_count`     | INT   | Total approved reviews   | New review approved/deleted |
| `_wc_rating_histogram` | JSON  | Rating distribution      | New review approved/deleted |

**Example `_wc_rating_histogram` value:**

```json
{ "5": 42, "4": 18, "3": 5, "2": 1, "1": 0 }
```

### 2.2 Entity Relationships

```
wp_users (WordPress Users)
    |
    | user_id (1:N)
    |
    v
wp_comments (Reviews)
    |
    |-- comment_post_ID (N:1) --> wp_posts (Products)
    |-- comment_id (1:N) --> wp_commentmeta (Rating, Verified, Helpful)
    |-- comment_parent (self-referential) --> wp_comments (Seller Responses)
    |
    v
Verification Check:
    woocommerce_order_items.product_id = comment_post_ID
    woocommerce_order_items.order_id --> wp_posts (post_type='shop_order')
    shop_order._customer_user = user_id
```

**Relationship Rules:**

1. **Review → Product** (`comment_post_ID` → `wp_posts.ID`)
   - Many reviews belong to one product
   - Enforced by foreign key constraint (WordPress core)
   - Cascade delete: Deleting product deletes all reviews

2. **Review → User** (`user_id` → `wp_users.ID`)
   - Many reviews belong to one user
   - Required for authentication and verified purchase check
   - Anonymous reviews NOT supported (user_id must be > 0)

3. **Review → Metadata** (`comment_id` → `wp_commentmeta.comment_id`)
   - One review has many metadata entries
   - Key metadata: `rating` (required), `verified` (calculated), `helpful` (optional)

4. **Review → Seller Response** (`comment_parent` → `wp_comments.comment_ID`)
   - One review can have one seller response (Phase 2)
   - Seller response is also a `comment_type = 'review'` with parent ID set
   - Max depth: 1 level (no nested threads)

### 2.3 Data Ownership and Lifecycle

**Review Creation Flow:**

```
User Authentication (JWT)
    → Next.js ReviewForm submission
    → Apollo Client mutation (submitReview)
    → WordPress GraphQL endpoint
    → Plugin validation (rating range, duplicate check, content length)
    → wp_insert_comment() with comment_approved='0'
    → update_comment_meta() for rating, verified flag
    → Return success response
    → Frontend shows "Review pending moderation" message
```

**Review Approval Flow:**

```
Admin logs into WordPress dashboard
    → Navigate to Comments → Reviews (filter by type='review')
    → Select review → Click "Approve"
    → WordPress sets comment_approved='1'
    → Trigger action hook: comment_status_review
    → Plugin listener updates product meta (_wc_average_rating, _wc_review_count)
    → Next.js product page refetch shows new review on next visit
```

**Review Deletion Flow:**

```
Admin clicks "Trash" or "Delete Permanently"
    → WordPress soft-deletes (comment_approved='trash') or hard-deletes
    → Trigger action hook: deleted_comment
    → Plugin listener recalculates product rating aggregates
    → Apollo cache invalidation (manual or TTL-based)
```

**Verified Purchase Calculation:**

```
On review submission (mutation resolver):
    $verified = wc_customer_bought_product(
        $user_email,     // From wp_users
        $user_id,        // From JWT token
        $product_id      // From mutation input
    );

WooCommerce function checks:
    SELECT order_items.order_item_id
    FROM woocommerce_order_items AS order_items
    INNER JOIN woocommerce_order_itemmeta AS itemmeta
        ON order_items.order_item_id = itemmeta.order_item_id
    INNER JOIN wp_posts AS orders
        ON order_items.order_id = orders.ID
    WHERE orders.post_type = 'shop_order'
        AND orders.post_status IN ('wc-completed', 'wc-processing')
        AND itemmeta.meta_key = '_product_id'
        AND itemmeta.meta_value = %d
        AND orders.post_author = %d
    LIMIT 1;

Result: TRUE if customer purchased product, FALSE otherwise
Store in commentmeta: meta_key='verified', meta_value='1'/'0'
```

### 2.4 Indexing Strategy

**Query Performance Optimization:**

#### Index 1: Product Review Lookup (Most Common Query)

```sql
-- Existing WordPress index
KEY comment_post_ID (comment_post_ID)

-- Optimized composite index (add via plugin activation hook)
CREATE INDEX idx_product_reviews
ON wp_comments(comment_post_ID, comment_approved, comment_date DESC)
WHERE comment_type = 'review';
```

**Query Pattern:**

```sql
-- Fetch approved reviews for product page
SELECT * FROM wp_comments
WHERE comment_post_ID = 123
  AND comment_approved = '1'
  AND comment_type = 'review'
ORDER BY comment_date DESC
LIMIT 10 OFFSET 0;
```

**Index Usage:** Covers WHERE, filter, and ORDER BY — single index scan, no filesort.

#### Index 2: User Review History

```sql
-- Existing WordPress index
KEY user_id (user_id)

-- Optimized for "My Reviews" page
CREATE INDEX idx_user_reviews
ON wp_comments(user_id, comment_approved, comment_date DESC)
WHERE comment_type = 'review';
```

**Query Pattern:**

```sql
-- Fetch all reviews by user
SELECT * FROM wp_comments
WHERE user_id = 456
  AND comment_type = 'review'
ORDER BY comment_date DESC;
```

#### Index 3: Moderation Queue

```sql
-- Existing WordPress composite index
KEY comment_approved_date_gmt (comment_approved, comment_date_gmt)

-- Additional filter on type
CREATE INDEX idx_moderation_queue
ON wp_comments(comment_approved, comment_type, comment_date DESC);
```

**Query Pattern:**

```sql
-- Admin moderation dashboard
SELECT * FROM wp_comments
WHERE comment_approved = '0'
  AND comment_type = 'review'
ORDER BY comment_date DESC
LIMIT 50;
```

#### Index 4: Commentmeta Lookups

```sql
-- Existing WordPress indexes
KEY comment_id (comment_id)
KEY meta_key (meta_key(191))

-- No additional indexes needed — small dataset per comment_id
```

**Performance Considerations:**

- **Index Maintenance:** WordPress automatically maintains core indexes
- **Custom Indexes:** Added via plugin activation hook using `$wpdb->query()`
- **Index Removal:** Dropped on plugin deactivation (optional cleanup)
- **Monitoring:** Check `EXPLAIN` output in MySQL slow query log

### 2.5 Cache Invalidation Rules

**Product Aggregate Cache (Critical Path):**

**Stored In:** `wp_postmeta` keys `_wc_average_rating`, `_wc_review_count`, `_wc_rating_histogram`

**Invalidation Triggers:**

1. New review approved (`comment_status_review` hook, `'0' → '1'`)
2. Review deleted (`deleted_comment` hook)
3. Review unapproved (`comment_unapproved_review` hook, `'1' → '0'`)
4. Review marked as spam (`comment_spam_review` hook)

**Update Logic (Plugin Implementation):**

```php
// Hook into WordPress comment status changes
add_action('comment_status_review', 'mebl_update_product_rating_cache', 10, 2);
add_action('deleted_comment', 'mebl_update_product_rating_cache_on_delete', 10, 1);

function mebl_update_product_rating_cache($new_status, $comment) {
    if ($comment->comment_type !== 'review') return;

    $product_id = $comment->comment_post_ID;

    // Query all approved reviews
    $ratings = $wpdb->get_col($wpdb->prepare("
        SELECT cm.meta_value
        FROM {$wpdb->comments} c
        INNER JOIN {$wpdb->commentmeta} cm ON c.comment_ID = cm.comment_id
        WHERE c.comment_post_ID = %d
          AND c.comment_approved = '1'
          AND c.comment_type = 'review'
          AND cm.meta_key = 'rating'
    ", $product_id));

    $count = count($ratings);
    $average = $count > 0 ? array_sum($ratings) / $count : 0;

    // Build histogram
    $histogram = array_fill(1, 5, 0);
    foreach ($ratings as $rating) {
        $histogram[(int)$rating]++;
    }

    // Update post meta (cached values)
    update_post_meta($product_id, '_wc_average_rating', round($average, 2));
    update_post_meta($product_id, '_wc_review_count', $count);
    update_post_meta($product_id, '_wc_rating_histogram', json_encode($histogram));

    // Invalidate WooCommerce transients
    delete_transient('wc_average_rating_' . $product_id);
}
```

**Apollo Client Cache Invalidation:**

**Strategy:** Time-based expiration + manual refetch on mutation success

**Configuration (Frontend):**

```typescript
// src/utils/apollo/ApolloClient.js
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        product: {
          // Cache reviews for 5 minutes
          read(existing, { args, toReference }) {
            return existing;
          },
        },
      },
    },
    Product: {
      fields: {
        reviews: {
          // Always fetch fresh reviews (no cache merge)
          merge: false,
        },
      },
    },
  },
});
```

**Manual Invalidation After Mutation:**

```typescript
const [submitReview] = useMutation(SUBMIT_REVIEW, {
  refetchQueries: [
    { query: GET_PRODUCT_REVIEWS, variables: { slug: productSlug } },
  ],
  awaitRefetchQueries: true,
});
```

**Transient Caching (WordPress):**

**Use Case:** Homepage "Recent Reviews" widget, category page review snippets

**Implementation:**

```php
function get_recent_reviews($limit = 5) {
    $cache_key = 'mebl_recent_reviews_' . $limit;
    $reviews = get_transient($cache_key);

    if ($reviews === false) {
        $reviews = get_comments([
            'type' => 'review',
            'status' => 'approve',
            'number' => $limit,
            'orderby' => 'comment_date',
            'order' => 'DESC'
        ]);

        set_transient($cache_key, $reviews, 5 * MINUTE_IN_SECONDS);
    }

    return $reviews;
}
```

**Invalidation:** WordPress automatically expires transients; no manual invalidation needed unless real-time updates required.

### 2.6 Data Migration and Seeding

**Scenario 1: Fresh Installation (No Existing Reviews)**

- No migration needed
- WordPress tables already exist
- Plugin activation creates custom indexes
- WooCommerce settings configured manually

**Scenario 2: Migrating From WooCommerce Native Reviews**

**Status Check:**

```sql
-- Check if existing reviews exist
SELECT COUNT(*) FROM wp_comments
WHERE comment_type = 'review'
  AND comment_post_ID IN (
    SELECT ID FROM wp_posts WHERE post_type = 'product'
  );
```

**If Count > 0:**

- Reviews already in correct table (`wp_comments`)
- Ensure `rating` metadata exists:

  ```php
  // Migration script (run once via WP-CLI or plugin activation)
  $reviews = get_comments(['type' => 'review', 'status' => 'all']);
  foreach ($reviews as $review) {
      $rating = get_comment_meta($review->comment_ID, 'rating', true);
      if (empty($rating)) {
          // Default to 5 stars if missing (or prompt admin to set)
          update_comment_meta($review->comment_ID, 'rating', 5);
      }

      // Calculate verified purchase retroactively
      $verified = wc_customer_bought_product(
          $review->comment_author_email,
          $review->user_id,
          $review->comment_post_ID
      );
      update_comment_meta($review->comment_ID, 'verified', $verified ? '1' : '0');
  }
  ```

**Scenario 3: Importing Reviews From External System**

**Not Applicable:** No existing review system to migrate from.

**Future Consideration:** If switching from SaaS (e.g., Yotpo), write custom importer:

1. Export CSV from external system
2. Map fields: `external_id → comment_ID`, `product_sku → comment_post_ID`
3. Insert via `wp_insert_comment()` with `comment_approved='1'` (skip moderation)
4. Preserve original `comment_date` for chronological integrity

### 2.7 Data Retention and Compliance

**GDPR Considerations:**

**User Right to Deletion:**

- When user account deleted, WordPress core automatically anonymizes comments
- `comment_author` becomes "Anonymous", `comment_author_email` cleared
- Review content preserved but de-identified
- Plugin must respect this behavior (no additional PII stored)

**User Right to Access:**

- WordPress core provides data export functionality (`/wp-admin/tools.php?page=export_personal_data`)
- Reviews automatically included in export
- No additional plugin code needed

**Data Retention Policy:**

- Reviews stored indefinitely by default
- Admin can configure auto-deletion after X years (optional, Phase 2)
- Trashed reviews auto-deleted after 30 days (WordPress default)

**PII Fields:**

- `comment_author` — Display name (public)
- `comment_author_email` — Email address (hidden from frontend, used for verification only)
- `comment_author_IP` — IP address (stored for spam prevention, not exposed via GraphQL)

**GraphQL Privacy Rules:**

- Email addresses NEVER returned in GraphQL queries
- IP addresses NEVER exposed
- Only approved reviews returned to unauthenticated users
- User's own pending reviews visible only when authenticated

---

**End of Part 2**

✅ Database schema documented  
✅ Entity relationships defined  
✅ Indexing strategy optimized  
✅ Cache invalidation rules specified  
✅ Data migration path outlined  
✅ GDPR compliance addressed

---
