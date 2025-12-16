# Product Review System - Implementation Plan

**Document Status:** Part 1 of 8 (In Progress)  
**Last Updated:** December 13, 2025  
**Architecture Decision:** WordPress/WooCommerce Native Reviews with GraphQL Bridge

---

## Part 1: Architecture Recap and Scope Definition

### 1.1 Architectural Decision Summary

**Selected Approach:** WordPress/WooCommerce Native Reviews exposed via GraphQL

**Rejected Alternatives:**

- ❌ **Custom Backend in This Repository** — Rejected due to data duplication complexity, need to sync product/order/user data between systems, and 3-5 engineer-weeks overhead vs. 1 week for WordPress extension
- ❌ **Dedicated Microservice (SaaS)** — Rejected due to vendor lock-in, 200-500ms SSR latency impact, limited customization control, and premature optimization (not multi-brand/geo yet)

**Core Rationale:**

1. **Data Ownership:** Reviews naturally belong with products in WooCommerce. Verified purchase validation requires order data already in `woocommerce_order_items` table.
2. **Existing Infrastructure:** Platform already queries `averageRating` and `reviewCount` GraphQL fields (currently unused) — minimal integration cost.
3. **Proven Scalability:** WordPress `wp_comments` table handles 100k+ reviews per product with proper indexing.
4. **Moderation Tooling:** WooCommerce native admin UI (`/wp-admin/edit-comments.php`) provides spam filtering, approval workflows without building custom dashboard.
5. **SEO Alignment:** Next.js SSR on product pages (`getServerSideProps`) can include reviews in initial HTML for Google Rich Snippets.

### 1.2 System Boundaries

**WordPress/WooCommerce Responsibilities:**

- Store review data in `wp_comments` and `wp_commentmeta` tables
- Validate verified purchase status via `wc_customer_bought_product()` function
- Provide moderation interface via WordPress admin dashboard
- Expose reviews via WPGraphQL schema extensions
- Calculate and cache aggregate ratings (`_wc_average_rating`, `_wc_review_count`)
- Handle spam prevention via WordPress core comment filters

**Custom Plugin (`mebl-review-bridge`) Responsibilities:**

- Register GraphQL types: `ProductReview`, `ProductReviewConnection`
- Extend WooCommerce product types (`SimpleProduct`, `VariableProduct`) with `reviews` field
- Implement `submitReview` GraphQL mutation
- Validate review submissions (rating range, content length, duplicate prevention)
- Bridge WooCommerce comment system to GraphQL schema
- Manage review metadata (`rating`, `verified`, `helpful` counts)

**Next.js Frontend Responsibilities:**

- Fetch reviews via Apollo Client during SSR (`getServerSideProps`)
- Render review list with pagination
- Provide review submission form with validation
- Handle authentication state for review submission
- Display aggregate ratings on product cards and product pages
- Implement client-side optimistic UI updates
- Generate structured data (JSON-LD) for SEO

**Apollo Client Middleware Responsibilities:**

- Inject WooCommerce session tokens (already implemented)
- Inject JWT authentication headers for mutations (already implemented)
- Manage GraphQL cache invalidation for reviews
- Handle network errors and retry logic

### 1.3 Scope Definition

#### Phase 1: Minimum Viable Product (MVP)

**Must-Have Features:**

1. ✅ **Rating Submission (1-5 stars)** — Core review functionality
2. ✅ **Text Review (50-500 characters)** — Required field with validation
3. ✅ **Verified Purchase Badge** — Visual indicator on reviews from confirmed customers
4. ✅ **Moderation Queue** — All reviews pending approval by default
5. ✅ **Average Rating Display** — Shown on product cards and product detail page
6. ✅ **Review Count** — "(47 reviews)" displayed next to rating
7. ✅ **Spam Prevention** — Require authentication, 1 review per product per user
8. ✅ **SSR Reviews** — First 10 reviews included in initial HTML for SEO

**Success Criteria:**

- Authenticated users can submit reviews
- Reviews appear in WordPress admin moderation queue
- Approved reviews display on product pages
- Average rating updates automatically when reviews approved
- Product page HTML includes review structured data for Google
- No performance regression on product page load time (<50ms added latency)

#### Phase 2: Enhanced Features (Post-MVP)

**Optional Features (Prioritized):**

1. **Helpful/Upvote Counter** — Users can mark reviews as helpful
2. **Sort Options** — Most Recent, Highest Rated, Most Helpful
3. **Image Uploads** — Customers can attach product photos
4. **Seller Responses** — Admin can reply to reviews publicly
5. **Email Notifications** — Notify customers when review approved
6. **Review Reminders** — Auto-email 7 days post-delivery requesting review
7. **Review Filtering** — Filter by star rating (5★, 4★, etc.)
8. **Review Reporting** — Users can flag inappropriate reviews

**Deferred to Future Phases:**

- Multi-language review support (requires WPML/Polylang)
- Video reviews
- Review incentives (loyalty points for reviews)
- Sentiment analysis/AI moderation
- Review syndication to external platforms

### 1.4 Non-Functional Requirements

**Performance:**

- Product page SSR time: <2 seconds (includes review fetch)
- Review submission response time: <500ms
- Average rating calculation: Cached in product meta, updated on approval
- Review list pagination: 10 reviews per page, lazy load additional pages

**Security:**

- All review submissions require JWT authentication
- Content sanitization via `wp_kses_post()` to prevent XSS
- Rate limiting: 1 review per product per user (enforced in mutation resolver)
- SQL injection prevention via WordPress prepared statements (built-in)
- Spam detection via Akismet (WordPress plugin, optional)

**Scalability:**

- Database indexes on `(comment_post_ID, comment_approved, comment_date DESC)`
- Transient caching for "recent reviews" widgets (5-minute TTL)
- Apollo Client cache for review lists (configurable TTL)
- Support for 10,000+ reviews per product without query performance degradation

**Accessibility:**

- ARIA labels for star ratings
- Keyboard navigation for review forms
- Screen reader announcements for review submission success/failure
- Semantic HTML for review lists (`<article>`, `<time>`, etc.)

**SEO:**

- Structured data (JSON-LD) for aggregate ratings and individual reviews
- Reviews included in initial SSR HTML (not lazy-loaded)
- Proper heading hierarchy (`<h2>` for "Customer Reviews")
- Canonical URLs for paginated review pages

### 1.5 Constraints and Assumptions

**Technical Constraints:**

1. **WordPress Hosting:** External hosting on home.pl (not in main repository)
2. **Database Access:** No direct SQL queries from Next.js (GraphQL only)
3. **Authentication:** Must use existing JWT token system (no new auth flow)
4. **Session Management:** Leverage existing WooCommerce session middleware
5. **No REST API:** GraphQL-only integration (no `wp-json` endpoints)

**Business Constraints:**

1. **Moderation Staffing:** Assume manual review approval (no AI auto-approval in MVP)
2. **Verified Purchase Only:** Optional enforcement (configurable in WooCommerce settings)
3. **Anonymous Reviews:** Not allowed (authentication required to reduce spam)

**Assumptions:**

1. WordPress plugins `WooCommerce`, `WPGraphQL`, `WPGraphQL for WooCommerce` are installed and active
2. WordPress database has sufficient storage for review content (estimate 1KB per review)
3. Home.pl MySQL server supports concurrent writes (review submissions won't block product page reads)
4. WordPress admin users have access to comment moderation dashboard
5. Product slugs are unique and stable (no URL changes after reviews published)

### 1.6 Integration Points

**Existing Systems:**

- ✅ Apollo Client with session middleware (`src/utils/apollo/ApolloClient.js`)
- ✅ JWT authentication system (`src/utils/auth.ts`)
- ✅ WooCommerce session management (localStorage `woo-session`)
- ✅ Product GraphQL queries (`src/utils/gql/PRODUCTS_AND_CATEGORIES_QUERY.js`)
- ✅ Product page SSR (`src/pages/product/[slug].tsx`)
- ✅ TypeScript product types (`src/types/product.ts`)

**New Dependencies:**

- WordPress plugin: `mebl-review-bridge` (custom, in this repository)
- GraphQL queries: `GET_PRODUCT_REVIEWS.js`, `SUBMIT_REVIEW.js` (new files)
- React components: `ProductReviews.component.tsx`, `ReviewForm.component.tsx`, `ReviewList.component.tsx` (new files)

### 1.7 Rollout Strategy

**Development Phase:**

1. Create WordPress plugin locally
2. Test GraphQL schema in GraphiQL IDE
3. Build Next.js components in isolation (Storybook optional)
4. Integration testing on staging environment

**Deployment Phase:**

1. Deploy WordPress plugin to home.pl production
2. Activate plugin and verify GraphQL schema
3. Deploy Next.js frontend with review components
4. Enable WooCommerce reviews in WordPress admin settings
5. Monitor error logs and performance metrics

**Rollback Plan:**

- Deactivate `mebl-review-bridge` plugin (reviews hidden, no data loss)
- Revert Next.js deployment (previous version without review components)
- Reviews data persists in WordPress database (safe to re-enable later)

---

**End of Part 1**

✅ Architecture decision confirmed  
✅ Scope boundaries defined  
✅ Constraints documented  
✅ Integration points identified

---

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

## Part 3: API Contracts and Integration Points

### 3.1 GraphQL Schema Definition

**Complete Schema Extension (WPGraphQL):**

```graphql
# ============================================
# OBJECT TYPES
# ============================================

"""
A product review with rating, content, and verification status.
"""
type ProductReview {
  """
  Unique review identifier (WordPress comment_ID)
  """
  id: ID!

  """
  Review author display name (publicly visible)
  """
  author: String!

  """
  Review text content (sanitized HTML allowed)
  """
  content: String!

  """
  Star rating (1-5 scale, integer)
  """
  rating: Int!

  """
  ISO 8601 formatted date (e.g., "2025-12-13T10:30:00")
  """
  date: String!

  """
  Whether reviewer purchased this product
  """
  verified: Boolean!

  """
  Number of helpful votes (Phase 2)
  """
  helpful: Int

  """
  Admin response to review (Phase 2)
  """
  response: ProductReviewResponse
}

"""
Admin response to a customer review (Phase 2 feature)
"""
type ProductReviewResponse {
  """
  Response author (admin username)
  """
  author: String!

  """
  Response content
  """
  content: String!

  """
  Response date (ISO 8601)
  """
  date: String!
}

"""
Connection type for paginated review lists
"""
type ProductReviewConnection {
  """
  List of review edges with cursor information
  """
  edges: [ProductReviewEdge!]!

  """
  Pagination metadata
  """
  pageInfo: PageInfo!

  """
  Total count of approved reviews for this product
  """
  totalCount: Int!
}

"""
Edge type for review pagination
"""
type ProductReviewEdge {
  """
  The review node
  """
  node: ProductReview!

  """
  Cursor for pagination (base64 encoded offset)
  """
  cursor: String!
}

"""
Rating distribution histogram
"""
type RatingHistogram {
  """
  Number of 5-star reviews
  """
  fiveStar: Int!

  """
  Number of 4-star reviews
  """
  fourStar: Int!

  """
  Number of 3-star reviews
  """
  threeStar: Int!

  """
  Number of 2-star reviews
  """
  twoStar: Int!

  """
  Number of 1-star reviews
  """
  oneStar: Int!
}

# ============================================
# EXTEND WOOCOMMERCE PRODUCT TYPES
# ============================================

extend type SimpleProduct {
  """
  Paginated list of approved product reviews
  """
  reviews(
    """
    Number of reviews to fetch (default: 10, max: 50)
    """
    first: Int = 10

    """
    Cursor for pagination (from previous pageInfo.endCursor)
    """
    after: String

    """
    Sort order: RECENT, HIGHEST_RATED, MOST_HELPFUL (Phase 2)
    """
    orderBy: ReviewOrderBy = RECENT
  ): ProductReviewConnection

  """
  Whether reviews are enabled for this product
  """
  reviewsAllowed: Boolean!

  """
  Average rating (1.0 - 5.0, null if no reviews)
  """
  averageRating: Float

  """
  Total count of approved reviews
  """
  reviewCount: Int!

  """
  Rating distribution histogram
  """
  ratingHistogram: RatingHistogram
}

extend type VariableProduct {
  """
  Paginated list of approved product reviews
  """
  reviews(
    first: Int = 10
    after: String
    orderBy: ReviewOrderBy = RECENT
  ): ProductReviewConnection

  """
  Whether reviews are enabled for this product
  """
  reviewsAllowed: Boolean!

  """
  Average rating (1.0 - 5.0, null if no reviews)
  """
  averageRating: Float

  """
  Total count of approved reviews
  """
  reviewCount: Int!

  """
  Rating distribution histogram
  """
  ratingHistogram: RatingHistogram
}

# ============================================
# ENUMS
# ============================================

"""
Review sorting options
"""
enum ReviewOrderBy {
  """
  Most recent first (default)
  """
  RECENT

  """
  Highest rated first (Phase 2)
  """
  HIGHEST_RATED

  """
  Most helpful first (Phase 2)
  """
  MOST_HELPFUL
}

# ============================================
# INPUT TYPES
# ============================================

"""
Input for submitting a product review
"""
input SubmitReviewInput {
  """
  Product database ID (required)
  """
  productId: Int!

  """
  Star rating (1-5, required)
  """
  rating: Int!

  """
  Review text (50-500 characters, required)
  """
  content: String!

  """
  Client mutation ID for request tracking
  """
  clientMutationId: String
}

"""
Input for marking a review as helpful (Phase 2)
"""
input MarkReviewHelpfulInput {
  """
  Review ID to upvote
  """
  reviewId: ID!

  """
  Client mutation ID
  """
  clientMutationId: String
}

"""
Input for reporting a review (Phase 2)
"""
input ReportReviewInput {
  """
  Review ID to report
  """
  reviewId: ID!

  """
  Reason for reporting
  """
  reason: String!

  """
  Client mutation ID
  """
  clientMutationId: String
}

# ============================================
# OUTPUT TYPES (MUTATIONS)
# ============================================

"""
Response payload for submitReview mutation
"""
type SubmitReviewPayload {
  """
  Whether submission was successful
  """
  success: Boolean!

  """
  User-facing message (success or error)
  """
  message: String!

  """
  The created review (null if pending moderation)
  """
  review: ProductReview

  """
  Client mutation ID (echo back from input)
  """
  clientMutationId: String
}

"""
Response payload for markReviewHelpful mutation (Phase 2)
"""
type MarkReviewHelpfulPayload {
  success: Boolean!
  message: String!
  review: ProductReview
  clientMutationId: String
}

"""
Response payload for reportReview mutation (Phase 2)
"""
type ReportReviewPayload {
  success: Boolean!
  message: String!
  clientMutationId: String
}

# ============================================
# MUTATIONS
# ============================================

extend type RootMutation {
  """
  Submit a product review (requires authentication)
  """
  submitReview(
    """
    Review submission data
    """
    input: SubmitReviewInput!
  ): SubmitReviewPayload

  """
  Mark a review as helpful (Phase 2, requires authentication)
  """
  markReviewHelpful(input: MarkReviewHelpfulInput!): MarkReviewHelpfulPayload

  """
  Report an inappropriate review (Phase 2, requires authentication)
  """
  reportReview(input: ReportReviewInput!): ReportReviewPayload
}
```

### 3.2 PHP Resolver Implementation

**File Structure:**

```
wordpress/mebl-review-bridge/
├── mebl-review-bridge.php              # Plugin entry point
├── includes/
│   ├── class-graphql-reviews.php       # Schema registration & resolvers
│   ├── class-review-validation.php     # Input validation logic
│   ├── class-review-cache.php          # Cache management
│   └── class-review-helpers.php        # Utility functions
└── README.md
```

#### Plugin Entry Point: `mebl-review-bridge.php`

```php
<?php
/**
 * Plugin Name: MEBL Review Bridge
 * Plugin URI: https://github.com/szpeqq/mebl
 * Description: Exposes WooCommerce product reviews via GraphQL for Next.js frontend
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Requires: WooCommerce
 * Author: MEBL Team
 * License: GPL v2 or later
 * Text Domain: mebl-review-bridge
 */

defined('ABSPATH') || exit;

// Plugin constants
define('MEBL_REVIEW_BRIDGE_VERSION', '1.0.0');
define('MEBL_REVIEW_BRIDGE_PATH', plugin_dir_path(__FILE__));
define('MEBL_REVIEW_BRIDGE_URL', plugin_dir_url(__FILE__));

// Check dependencies on activation
register_activation_hook(__FILE__, 'mebl_review_bridge_activation');

function mebl_review_bridge_activation() {
    if (!class_exists('WooCommerce')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(
            __('MEBL Review Bridge requires WooCommerce to be installed and active.', 'mebl-review-bridge'),
            __('Plugin Activation Error', 'mebl-review-bridge'),
            ['back_link' => true]
        );
    }

    // Create custom indexes for performance
    mebl_review_bridge_create_indexes();

    // Flush rewrite rules
    flush_rewrite_rules();
}

function mebl_review_bridge_create_indexes() {
    global $wpdb;

    // Index for product review lookups (if not exists)
    $wpdb->query("
        CREATE INDEX IF NOT EXISTS idx_mebl_product_reviews
        ON {$wpdb->comments}(comment_post_ID, comment_approved, comment_date)
        WHERE comment_type = 'review'
    ");

    // Index for user review history
    $wpdb->query("
        CREATE INDEX IF NOT EXISTS idx_mebl_user_reviews
        ON {$wpdb->comments}(user_id, comment_approved, comment_date)
        WHERE comment_type = 'review'
    ");
}

// Admin notices
add_action('admin_init', 'mebl_review_bridge_check_dependencies');

function mebl_review_bridge_check_dependencies() {
    if (!class_exists('WPGraphQL')) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p><strong>MEBL Review Bridge:</strong> ';
            echo __('WPGraphQL plugin is recommended for full functionality.', 'mebl-review-bridge');
            echo '</p></div>';
        });
    }
}

// Load plugin classes
require_once MEBL_REVIEW_BRIDGE_PATH . 'includes/class-review-helpers.php';
require_once MEBL_REVIEW_BRIDGE_PATH . 'includes/class-review-validation.php';
require_once MEBL_REVIEW_BRIDGE_PATH . 'includes/class-review-cache.php';
require_once MEBL_REVIEW_BRIDGE_PATH . 'includes/class-graphql-reviews.php';

// Initialize plugin
add_action('plugins_loaded', 'mebl_review_bridge_init');

function mebl_review_bridge_init() {
    // Only initialize GraphQL if WPGraphQL is active
    if (class_exists('WPGraphQL')) {
        MEBL_Review_GraphQL::init();
    }

    // Initialize cache management (runs regardless of GraphQL)
    MEBL_Review_Cache::init();
}
```

#### GraphQL Schema Registration: `includes/class-graphql-reviews.php`

```php
<?php
/**
 * GraphQL schema registration and resolvers
 */
class MEBL_Review_GraphQL {

    public static function init() {
        add_action('graphql_register_types', [__CLASS__, 'register_types']);
    }

    /**
     * Register all GraphQL types, fields, and mutations
     */
    public static function register_types() {
        self::register_object_types();
        self::register_enums();
        self::register_product_fields();
        self::register_mutations();
    }

    /**
     * Register ProductReview and related object types
     */
    private static function register_object_types() {
        // ProductReview type
        register_graphql_object_type('ProductReview', [
            'description' => __('A product review with rating and content', 'mebl-review-bridge'),
            'fields' => [
                'id' => [
                    'type' => ['non_null' => 'ID'],
                    'description' => __('Review ID', 'mebl-review-bridge'),
                ],
                'author' => [
                    'type' => ['non_null' => 'String'],
                    'description' => __('Review author name', 'mebl-review-bridge'),
                ],
                'content' => [
                    'type' => ['non_null' => 'String'],
                    'description' => __('Review text content', 'mebl-review-bridge'),
                ],
                'rating' => [
                    'type' => ['non_null' => 'Int'],
                    'description' => __('Star rating (1-5)', 'mebl-review-bridge'),
                ],
                'date' => [
                    'type' => ['non_null' => 'String'],
                    'description' => __('Review date (ISO 8601)', 'mebl-review-bridge'),
                ],
                'verified' => [
                    'type' => ['non_null' => 'Boolean'],
                    'description' => __('Verified purchase flag', 'mebl-review-bridge'),
                ],
                'helpful' => [
                    'type' => 'Int',
                    'description' => __('Helpful vote count', 'mebl-review-bridge'),
                ],
            ],
        ]);

        // RatingHistogram type
        register_graphql_object_type('RatingHistogram', [
            'description' => __('Rating distribution', 'mebl-review-bridge'),
            'fields' => [
                'fiveStar' => ['type' => ['non_null' => 'Int']],
                'fourStar' => ['type' => ['non_null' => 'Int']],
                'threeStar' => ['type' => ['non_null' => 'Int']],
                'twoStar' => ['type' => ['non_null' => 'Int']],
                'oneStar' => ['type' => ['non_null' => 'Int']],
            ],
        ]);

        // ProductReviewConnection type
        register_graphql_connection([
            'fromType' => 'Product',
            'toType' => 'ProductReview',
            'fromFieldName' => 'reviews',
            'connectionArgs' => [
                'orderBy' => [
                    'type' => 'ReviewOrderBy',
                    'description' => __('Sort order', 'mebl-review-bridge'),
                ],
            ],
            'resolve' => function($source, $args, $context, $info) {
                return self::resolve_reviews_connection($source, $args);
            },
        ]);
    }

    /**
     * Register ReviewOrderBy enum
     */
    private static function register_enums() {
        register_graphql_enum_type('ReviewOrderBy', [
            'description' => __('Review sorting options', 'mebl-review-bridge'),
            'values' => [
                'RECENT' => ['value' => 'recent'],
                'HIGHEST_RATED' => ['value' => 'highest_rated'],
                'MOST_HELPFUL' => ['value' => 'most_helpful'],
            ],
        ]);
    }

    /**
     * Add review fields to WooCommerce product types
     */
    private static function register_product_fields() {
        $product_types = ['SimpleProduct', 'VariableProduct', 'ExternalProduct', 'GroupProduct'];

        foreach ($product_types as $type) {
            // reviewsAllowed field
            register_graphql_field($type, 'reviewsAllowed', [
                'type' => ['non_null' => 'Boolean'],
                'description' => __('Whether reviews are enabled', 'mebl-review-bridge'),
                'resolve' => function($product) {
                    return comments_open($product->databaseId);
                },
            ]);

            // averageRating field
            register_graphql_field($type, 'averageRating', [
                'type' => 'Float',
                'description' => __('Average rating (1.0-5.0)', 'mebl-review-bridge'),
                'resolve' => function($product) {
                    $rating = get_post_meta($product->databaseId, '_wc_average_rating', true);
                    return $rating ? (float) $rating : null;
                },
            ]);

            // reviewCount field
            register_graphql_field($type, 'reviewCount', [
                'type' => ['non_null' => 'Int'],
                'description' => __('Total approved reviews', 'mebl-review-bridge'),
                'resolve' => function($product) {
                    $count = get_post_meta($product->databaseId, '_wc_review_count', true);
                    return $count ? (int) $count : 0;
                },
            ]);

            // ratingHistogram field
            register_graphql_field($type, 'ratingHistogram', [
                'type' => 'RatingHistogram',
                'description' => __('Rating distribution', 'mebl-review-bridge'),
                'resolve' => function($product) {
                    $histogram = get_post_meta($product->databaseId, '_wc_rating_histogram', true);

                    if (empty($histogram)) {
                        return null;
                    }

                    $data = json_decode($histogram, true);
                    return [
                        'fiveStar' => $data['5'] ?? 0,
                        'fourStar' => $data['4'] ?? 0,
                        'threeStar' => $data['3'] ?? 0,
                        'twoStar' => $data['2'] ?? 0,
                        'oneStar' => $data['1'] ?? 0,
                    ];
                },
            ]);
        }
    }

    /**
     * Register mutations
     */
    private static function register_mutations() {
        // submitReview mutation
        register_graphql_mutation('submitReview', [
            'inputFields' => [
                'productId' => [
                    'type' => ['non_null' => 'Int'],
                    'description' => __('Product database ID', 'mebl-review-bridge'),
                ],
                'rating' => [
                    'type' => ['non_null' => 'Int'],
                    'description' => __('Star rating (1-5)', 'mebl-review-bridge'),
                ],
                'content' => [
                    'type' => ['non_null' => 'String'],
                    'description' => __('Review text', 'mebl-review-bridge'),
                ],
            ],
            'outputFields' => [
                'success' => ['type' => ['non_null' => 'Boolean']],
                'message' => ['type' => ['non_null' => 'String']],
                'review' => ['type' => 'ProductReview'],
            ],
            'mutateAndGetPayload' => function($input, $context) {
                return self::submit_review_mutation($input, $context);
            },
        ]);
    }

    /**
     * Resolve reviews connection (paginated)
     */
    private static function resolve_reviews_connection($product, $args) {
        $product_id = $product->databaseId;
        $first = $args['first'] ?? 10;
        $first = min($first, 50); // Max 50 reviews per page
        $offset = 0;

        // Decode cursor for pagination
        if (!empty($args['after'])) {
            $offset = (int) base64_decode($args['after']);
        }

        // Determine sort order
        $orderby = 'comment_date';
        $order = 'DESC';

        if (!empty($args['orderBy'])) {
            switch ($args['orderBy']) {
                case 'highest_rated':
                    $orderby = 'meta_value_num';
                    $order = 'DESC';
                    break;
                case 'most_helpful':
                    $orderby = 'meta_value_num';
                    $order = 'DESC';
                    break;
            }
        }

        // Fetch reviews
        $comment_args = [
            'post_id' => $product_id,
            'status' => 'approve',
            'type' => 'review',
            'number' => $first + 1, // Fetch one extra to check hasNextPage
            'offset' => $offset,
            'orderby' => $orderby,
            'order' => $order,
        ];

        // Add meta query for sorting by rating or helpful
        if ($orderby === 'meta_value_num') {
            $comment_args['meta_key'] = $args['orderBy'] === 'highest_rated' ? 'rating' : 'helpful';
        }

        $comments = get_comments($comment_args);

        // Check if there's a next page
        $has_next_page = count($comments) > $first;
        if ($has_next_page) {
            array_pop($comments); // Remove extra item
        }

        // Format edges
        $edges = [];
        foreach ($comments as $index => $comment) {
            $edges[] = [
                'node' => self::format_review($comment),
                'cursor' => base64_encode((string)($offset + $index + 1)),
            ];
        }

        // Get total count
        $total_count = (int) get_post_meta($product_id, '_wc_review_count', true);

        return [
            'edges' => $edges,
            'pageInfo' => [
                'hasNextPage' => $has_next_page,
                'hasPreviousPage' => $offset > 0,
                'startCursor' => !empty($edges) ? $edges[0]['cursor'] : null,
                'endCursor' => !empty($edges) ? end($edges)['cursor'] : null,
            ],
            'totalCount' => $total_count,
        ];
    }

    /**
     * Format WordPress comment as ProductReview
     */
    private static function format_review($comment) {
        $rating = (int) get_comment_meta($comment->comment_ID, 'rating', true);
        $verified = get_comment_meta($comment->comment_ID, 'verified', true) === '1';
        $helpful = (int) get_comment_meta($comment->comment_ID, 'helpful', true);

        return [
            'id' => (string) $comment->comment_ID,
            'author' => $comment->comment_author,
            'content' => $comment->comment_content,
            'rating' => $rating ?: 5, // Default to 5 if missing
            'date' => mysql2date('c', $comment->comment_date_gmt, false), // ISO 8601
            'verified' => $verified,
            'helpful' => $helpful ?: 0,
        ];
    }

    /**
     * Submit review mutation handler
     */
    private static function submit_review_mutation($input, $context) {
        // Validation
        $validation = MEBL_Review_Validation::validate_submission($input, $context);

        if (!$validation['valid']) {
            return [
                'success' => false,
                'message' => $validation['message'],
                'review' => null,
            ];
        }

        $user = wp_get_current_user();
        $product_id = $input['productId'];

        // Check verified purchase
        $verified = wc_customer_bought_product(
            $user->user_email,
            $user->ID,
            $product_id
        );

        // Insert comment
        $comment_data = [
            'comment_post_ID' => $product_id,
            'comment_author' => $user->display_name,
            'comment_author_email' => $user->user_email,
            'comment_content' => wp_kses_post($input['content']),
            'user_id' => $user->ID,
            'comment_type' => 'review',
            'comment_approved' => 0, // Pending moderation
            'comment_date' => current_time('mysql'),
            'comment_date_gmt' => current_time('mysql', 1),
        ];

        $comment_id = wp_insert_comment($comment_data);

        if (!$comment_id || is_wp_error($comment_id)) {
            return [
                'success' => false,
                'message' => __('Failed to submit review. Please try again.', 'mebl-review-bridge'),
                'review' => null,
            ];
        }

        // Store metadata
        update_comment_meta($comment_id, 'rating', $input['rating']);
        update_comment_meta($comment_id, 'verified', $verified ? '1' : '0');
        update_comment_meta($comment_id, 'helpful', 0);

        // Trigger cache update (will run when admin approves)
        do_action('mebl_review_submitted', $comment_id, $product_id);

        return [
            'success' => true,
            'message' => __('Review submitted successfully and is awaiting moderation.', 'mebl-review-bridge'),
            'review' => null, // Don't return review until approved
        ];
    }
}
```

#### Validation Class: `includes/class-review-validation.php`

```php
<?php
/**
 * Review submission validation
 */
class MEBL_Review_Validation {

    /**
     * Validate review submission
     *
     * @param array $input Mutation input
     * @param object $context GraphQL context
     * @return array ['valid' => bool, 'message' => string]
     */
    public static function validate_submission($input, $context) {
        // Check authentication
        if (!is_user_logged_in()) {
            return [
                'valid' => false,
                'message' => __('You must be logged in to submit a review.', 'mebl-review-bridge'),
            ];
        }

        $user = wp_get_current_user();
        $product_id = $input['productId'];

        // Check product exists
        $product = wc_get_product($product_id);
        if (!$product) {
            return [
                'valid' => false,
                'message' => __('Product not found.', 'mebl-review-bridge'),
            ];
        }

        // Check reviews are enabled
        if (!comments_open($product_id)) {
            return [
                'valid' => false,
                'message' => __('Reviews are not enabled for this product.', 'mebl-review-bridge'),
            ];
        }

        // Validate rating range
        if ($input['rating'] < 1 || $input['rating'] > 5) {
            return [
                'valid' => false,
                'message' => __('Rating must be between 1 and 5 stars.', 'mebl-review-bridge'),
            ];
        }

        // Validate content length
        $content = trim($input['content']);
        $content_length = mb_strlen($content);

        if ($content_length < 10) {
            return [
                'valid' => false,
                'message' => __('Review must be at least 10 characters long.', 'mebl-review-bridge'),
            ];
        }

        if ($content_length > 5000) {
            return [
                'valid' => false,
                'message' => __('Review must be less than 5000 characters.', 'mebl-review-bridge'),
            ];
        }

        // Check duplicate review
        $existing = get_comments([
            'post_id' => $product_id,
            'user_id' => $user->ID,
            'type' => 'review',
            'count' => true,
        ]);

        if ($existing > 0) {
            return [
                'valid' => false,
                'message' => __('You have already reviewed this product.', 'mebl-review-bridge'),
            ];
        }

        // Rate limiting (max 5 reviews per hour per user)
        $recent_reviews = get_comments([
            'user_id' => $user->ID,
            'type' => 'review',
            'date_query' => [
                'after' => '1 hour ago',
            ],
            'count' => true,
        ]);

        if ($recent_reviews >= 5) {
            return [
                'valid' => false,
                'message' => __('You are submitting reviews too quickly. Please try again later.', 'mebl-review-bridge'),
            ];
        }

        return ['valid' => true, 'message' => ''];
    }
}
```

#### Cache Management: `includes/class-review-cache.php`

```php
<?php
/**
 * Review cache management
 */
class MEBL_Review_Cache {

    public static function init() {
        // Update cache when review status changes
        add_action('comment_post', [__CLASS__, 'on_comment_created'], 10, 2);
        add_action('transition_comment_status', [__CLASS__, 'on_status_change'], 10, 3);
        add_action('deleted_comment', [__CLASS__, 'on_comment_deleted'], 10, 2);
    }

    /**
     * Handle new comment creation
     */
    public static function on_comment_created($comment_id, $comment_approved) {
        $comment = get_comment($comment_id);

        if ($comment->comment_type !== 'review') {
            return;
        }

        // Only update cache if approved immediately
        if ($comment_approved === 1 || $comment_approved === 'approve') {
            self::update_product_cache($comment->comment_post_ID);
        }
    }

    /**
     * Handle comment status transitions
     */
    public static function on_status_change($new_status, $old_status, $comment) {
        if ($comment->comment_type !== 'review') {
            return;
        }

        // Update cache on any status change affecting approved count
        if ($new_status !== $old_status) {
            self::update_product_cache($comment->comment_post_ID);
        }
    }

    /**
     * Handle comment deletion
     */
    public static function on_comment_deleted($comment_id, $comment) {
        if ($comment->comment_type !== 'review') {
            return;
        }

        self::update_product_cache($comment->comment_post_ID);
    }

    /**
     * Update product rating cache
     */
    public static function update_product_cache($product_id) {
        global $wpdb;

        // Fetch all approved review ratings
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

        if ($count === 0) {
            // No reviews - clear cache
            delete_post_meta($product_id, '_wc_average_rating');
            delete_post_meta($product_id, '_wc_review_count');
            delete_post_meta($product_id, '_wc_rating_histogram');
            return;
        }

        // Calculate average
        $total = array_sum(array_map('intval', $ratings));
        $average = $total / $count;

        // Build histogram
        $histogram = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        foreach ($ratings as $rating) {
            $rating_int = (int) $rating;
            if (isset($histogram[$rating_int])) {
                $histogram[$rating_int]++;
            }
        }

        // Update post meta
        update_post_meta($product_id, '_wc_average_rating', round($average, 2));
        update_post_meta($product_id, '_wc_review_count', $count);
        update_post_meta($product_id, '_wc_rating_histogram', wp_json_encode($histogram));

        // Clear transients
        delete_transient('wc_product_' . $product_id . '_rating');

        // Trigger action for external integrations
        do_action('mebl_review_cache_updated', $product_id, $average, $count);
    }
}
```

### 3.3 Frontend GraphQL Queries

**File: `src/utils/gql/GET_PRODUCT_REVIEWS.js`**

```javascript
import { gql } from '@apollo/client';

export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews(
    $slug: ID!
    $first: Int = 10
    $after: String
    $orderBy: ReviewOrderBy = RECENT
  ) {
    product(id: $slug, idType: SLUG) {
      databaseId
      name
      slug

      # Review metadata
      reviewsAllowed
      averageRating
      reviewCount
      ratingHistogram {
        fiveStar
        fourStar
        threeStar
        twoStar
        oneStar
      }

      # Paginated reviews
      reviews(first: $first, after: $after, orderBy: $orderBy) {
        edges {
          node {
            id
            author
            content
            rating
            date
            verified
            helpful
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  }
`;
```

**File: `src/utils/gql/SUBMIT_REVIEW.js`**

```javascript
import { gql } from '@apollo/client';

export const SUBMIT_REVIEW = gql`
  mutation SubmitReview($input: SubmitReviewInput!) {
    submitReview(input: $input) {
      success
      message
      review {
        id
        author
        content
        rating
        date
        verified
      }
      clientMutationId
    }
  }
`;
```

### 3.4 TypeScript Type Definitions

**File: `src/types/review.ts`**

```typescript
/**
 * Product review data structure
 */
export interface ProductReview {
  id: string;
  author: string;
  content: string;
  rating: number; // 1-5
  date: string; // ISO 8601
  verified: boolean;
  helpful?: number;
}

/**
 * Rating distribution histogram
 */
export interface RatingHistogram {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

/**
 * Review connection for pagination
 */
export interface ProductReviewConnection {
  edges: ProductReviewEdge[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface ProductReviewEdge {
  node: ProductReview;
  cursor: string;
}

/**
 * Review submission input
 */
export interface SubmitReviewInput {
  productId: number;
  rating: number;
  content: string;
  clientMutationId?: string;
}

/**
 * Review submission response
 */
export interface SubmitReviewPayload {
  success: boolean;
  message: string;
  review?: ProductReview | null;
  clientMutationId?: string;
}

/**
 * Review sort options
 */
export enum ReviewOrderBy {
  RECENT = 'RECENT',
  HIGHEST_RATED = 'HIGHEST_RATED',
  MOST_HELPFUL = 'MOST_HELPFUL',
}
```

**Extend: `src/types/product.ts`**

```typescript
import {
  ProductReview,
  ProductReviewConnection,
  RatingHistogram,
} from './review';

export interface Product {
  // ... existing fields ...

  // Review fields
  reviewsAllowed: boolean;
  averageRating?: number | null;
  reviewCount: number;
  ratingHistogram?: RatingHistogram | null;
  reviews?: ProductReviewConnection;
}
```

### 3.5 Error Handling Patterns

**GraphQL Error Responses:**

```typescript
// Success response
{
  "data": {
    "submitReview": {
      "success": true,
      "message": "Review submitted successfully and is awaiting moderation.",
      "review": null
    }
  }
}

// Validation error (user-facing)
{
  "data": {
    "submitReview": {
      "success": false,
      "message": "Review must be at least 10 characters long.",
      "review": null
    }
  }
}

// Authentication error
{
  "data": {
    "submitReview": {
      "success": false,
      "message": "You must be logged in to submit a review.",
      "review": null
    }
  }
}

// Server error (unexpected)
{
  "errors": [
    {
      "message": "Internal server error",
      "extensions": {
        "category": "internal"
      }
    }
  ],
  "data": {
    "submitReview": null
  }
}
```

**Frontend Error Handling:**

```typescript
try {
  const { data } = await submitReview({
    variables: {
      input: {
        productId: product.databaseId,
        rating: selectedRating,
        content: reviewText,
      },
    },
  });

  if (data?.submitReview?.success) {
    toast.success(data.submitReview.message);
    setReviewText('');
    setSelectedRating(0);
  } else {
    toast.error(data?.submitReview?.message || 'Failed to submit review');
  }
} catch (error) {
  console.error('Review submission error:', error);
  toast.error('An unexpected error occurred. Please try again.');
}
```

---

**End of Part 3**

✅ Complete GraphQL schema defined  
✅ PHP resolver implementation detailed  
✅ Frontend GraphQL queries specified  
✅ TypeScript types documented  
✅ Error handling patterns established

---

## Part 4: Backend Implementation Details

### 4.1 WordPress Admin Integration

#### Moderation Dashboard Customization

**File: `includes/class-admin-ui.php`**

```php
<?php
/**
 * WordPress admin UI customization for review moderation
 */
class MEBL_Review_Admin_UI {

    public static function init() {
        // Add custom columns to comments list
        add_filter('manage_edit-comments_columns', [__CLASS__, 'add_custom_columns']);
        add_action('manage_comments_custom_column', [__CLASS__, 'render_custom_columns'], 10, 2);

        // Add filter dropdown for review type
        add_action('restrict_manage_comments', [__CLASS__, 'add_filter_dropdown']);

        // Add rating quick edit field
        add_action('add_meta_boxes_comment', [__CLASS__, 'add_rating_meta_box']);

        // Add bulk actions
        add_filter('bulk_actions-edit-comments', [__CLASS__, 'add_bulk_actions']);
        add_filter('handle_bulk_actions-edit-comments', [__CLASS__, 'handle_bulk_actions'], 10, 3);

        // Customize comment row actions
        add_filter('comment_row_actions', [__CLASS__, 'modify_row_actions'], 10, 2);
    }

    /**
     * Add custom columns to comments list table
     */
    public static function add_custom_columns($columns) {
        // Insert rating column after author
        $new_columns = [];
        foreach ($columns as $key => $value) {
            $new_columns[$key] = $value;
            if ($key === 'author') {
                $new_columns['rating'] = __('Rating', 'mebl-review-bridge');
                $new_columns['verified'] = __('Verified', 'mebl-review-bridge');
            }
        }
        return $new_columns;
    }

    /**
     * Render custom column content
     */
    public static function render_custom_columns($column, $comment_id) {
        $comment = get_comment($comment_id);

        if ($comment->comment_type !== 'review') {
            return;
        }

        switch ($column) {
            case 'rating':
                $rating = (int) get_comment_meta($comment_id, 'rating', true);
                echo str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
                echo ' <span class="rating-number">(' . $rating . '/5)</span>';
                break;

            case 'verified':
                $verified = get_comment_meta($comment_id, 'verified', true) === '1';
                if ($verified) {
                    echo '<span class="dashicons dashicons-yes-alt" style="color: #46b450;" title="Verified Purchase"></span>';
                } else {
                    echo '<span class="dashicons dashicons-minus" style="color: #ddd;" title="Not Verified"></span>';
                }
                break;
        }
    }

    /**
     * Add filter dropdown for review type
     */
    public static function add_filter_dropdown() {
        $screen = get_current_screen();
        if ($screen->id !== 'edit-comments') {
            return;
        }

        $current_type = isset($_GET['comment_type']) ? $_GET['comment_type'] : '';
        ?>
        <label class="screen-reader-text" for="filter-by-review-type">
            <?php _e('Filter by type', 'mebl-review-bridge'); ?>
        </label>
        <select name="comment_type" id="filter-by-review-type">
            <option value=""><?php _e('All comment types', 'mebl-review-bridge'); ?></option>
            <option value="review" <?php selected($current_type, 'review'); ?>>
                <?php _e('Product Reviews', 'mebl-review-bridge'); ?>
            </option>
            <option value="comment" <?php selected($current_type, 'comment'); ?>>
                <?php _e('Blog Comments', 'mebl-review-bridge'); ?>
            </option>
        </select>
        <?php
    }

    /**
     * Add rating meta box to comment edit screen
     */
    public static function add_rating_meta_box($comment) {
        if ($comment->comment_type !== 'review') {
            return;
        }

        add_meta_box(
            'mebl_review_rating',
            __('Review Rating', 'mebl-review-bridge'),
            [__CLASS__, 'render_rating_meta_box'],
            'comment',
            'normal',
            'high'
        );
    }

    /**
     * Render rating meta box content
     */
    public static function render_rating_meta_box($comment) {
        $rating = (int) get_comment_meta($comment->comment_ID, 'rating', true);
        $verified = get_comment_meta($comment->comment_ID, 'verified', true) === '1';
        $helpful = (int) get_comment_meta($comment->comment_ID, 'helpful', true);

        wp_nonce_field('mebl_review_rating_nonce', 'mebl_review_rating_nonce');
        ?>
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="mebl_rating"><?php _e('Star Rating', 'mebl-review-bridge'); ?></label>
                </th>
                <td>
                    <select name="mebl_rating" id="mebl_rating">
                        <?php for ($i = 1; $i <= 5; $i++) : ?>
                            <option value="<?php echo $i; ?>" <?php selected($rating, $i); ?>>
                                <?php echo $i . ' ' . _n('Star', 'Stars', $i, 'mebl-review-bridge'); ?>
                            </option>
                        <?php endfor; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Verified Purchase', 'mebl-review-bridge'); ?></th>
                <td>
                    <?php if ($verified) : ?>
                        <span class="dashicons dashicons-yes-alt" style="color: #46b450;"></span>
                        <?php _e('Yes', 'mebl-review-bridge'); ?>
                    <?php else : ?>
                        <span class="dashicons dashicons-minus" style="color: #ddd;"></span>
                        <?php _e('No', 'mebl-review-bridge'); ?>
                    <?php endif; ?>
                    <p class="description">
                        <?php _e('Automatically determined based on order history. Cannot be manually changed.', 'mebl-review-bridge'); ?>
                    </p>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Helpful Votes', 'mebl-review-bridge'); ?></th>
                <td>
                    <strong><?php echo $helpful; ?></strong>
                    <p class="description">
                        <?php _e('Number of users who found this review helpful.', 'mebl-review-bridge'); ?>
                    </p>
                </td>
            </tr>
        </table>
        <?php
    }

    /**
     * Save rating meta box data
     */
    public static function save_rating_meta_box($comment_id) {
        // Verify nonce
        if (!isset($_POST['mebl_review_rating_nonce']) ||
            !wp_verify_nonce($_POST['mebl_review_rating_nonce'], 'mebl_review_rating_nonce')) {
            return;
        }

        // Check permissions
        if (!current_user_can('edit_comment', $comment_id)) {
            return;
        }

        // Update rating
        if (isset($_POST['mebl_rating'])) {
            $rating = intval($_POST['mebl_rating']);
            if ($rating >= 1 && $rating <= 5) {
                update_comment_meta($comment_id, 'rating', $rating);

                // Trigger cache update
                $comment = get_comment($comment_id);
                if ($comment->comment_approved === '1') {
                    MEBL_Review_Cache::update_product_cache($comment->comment_post_ID);
                }
            }
        }
    }

    /**
     * Add custom bulk actions
     */
    public static function add_bulk_actions($actions) {
        $actions['approve_reviews'] = __('Approve Reviews', 'mebl-review-bridge');
        $actions['mark_spam_reviews'] = __('Mark as Spam (Reviews)', 'mebl-review-bridge');
        return $actions;
    }

    /**
     * Handle custom bulk actions
     */
    public static function handle_bulk_actions($redirect_to, $action, $comment_ids) {
        if ($action === 'approve_reviews') {
            foreach ($comment_ids as $comment_id) {
                $comment = get_comment($comment_id);
                if ($comment->comment_type === 'review') {
                    wp_set_comment_status($comment_id, 'approve');
                }
            }
            $redirect_to = add_query_arg('bulk_reviews_approved', count($comment_ids), $redirect_to);
        }

        if ($action === 'mark_spam_reviews') {
            foreach ($comment_ids as $comment_id) {
                $comment = get_comment($comment_id);
                if ($comment->comment_type === 'review') {
                    wp_spam_comment($comment_id);
                }
            }
            $redirect_to = add_query_arg('bulk_reviews_spam', count($comment_ids), $redirect_to);
        }

        return $redirect_to;
    }

    /**
     * Modify comment row actions
     */
    public static function modify_row_actions($actions, $comment) {
        if ($comment->comment_type !== 'review') {
            return $actions;
        }

        // Add "View Product" action
        $product = get_post($comment->comment_post_ID);
        if ($product) {
            $product_url = get_permalink($product->ID);
            $actions['view_product'] = sprintf(
                '<a href="%s" target="_blank">%s</a>',
                esc_url($product_url),
                __('View Product', 'mebl-review-bridge')
            );
        }

        return $actions;
    }
}

// Hook into comment edit save
add_action('edit_comment', ['MEBL_Review_Admin_UI', 'save_rating_meta_box']);
```

#### Admin Notice System

**Add to plugin entry file:**

```php
/**
 * Display admin notices for bulk actions
 */
add_action('admin_notices', function() {
    if (!empty($_GET['bulk_reviews_approved'])) {
        $count = intval($_GET['bulk_reviews_approved']);
        printf(
            '<div class="notice notice-success is-dismissible"><p>%s</p></div>',
            sprintf(
                _n('%d review approved.', '%d reviews approved.', $count, 'mebl-review-bridge'),
                $count
            )
        );
    }

    if (!empty($_GET['bulk_reviews_spam'])) {
        $count = intval($_GET['bulk_reviews_spam']);
        printf(
            '<div class="notice notice-warning is-dismissible"><p>%s</p></div>',
            sprintf(
                _n('%d review marked as spam.', '%d reviews marked as spam.', $count, 'mebl-review-bridge'),
                $count
            )
        );
    }
});
```

### 4.2 WordPress Hooks and Actions

**Custom Action Hooks (for extensibility):**

```php
// Triggered when a review is submitted (pending moderation)
do_action('mebl_review_submitted', $comment_id, $product_id);

// Triggered when a review is approved
do_action('mebl_review_approved', $comment_id, $product_id);

// Triggered when review cache is updated
do_action('mebl_review_cache_updated', $product_id, $average_rating, $review_count);

// Triggered when a review is marked as helpful (Phase 2)
do_action('mebl_review_helpful', $comment_id, $user_id);

// Triggered when a review is reported (Phase 2)
do_action('mebl_review_reported', $comment_id, $user_id, $reason);
```

**Integration Example (Email Notifications):**

```php
/**
 * Send email notification when review is approved
 */
add_action('mebl_review_approved', function($comment_id, $product_id) {
    $comment = get_comment($comment_id);
    $product = wc_get_product($product_id);

    if (!$comment || !$product) {
        return;
    }

    // Email to reviewer
    $to = $comment->comment_author_email;
    $subject = sprintf(
        __('Your review of %s has been approved', 'mebl-review-bridge'),
        $product->get_name()
    );
    $message = sprintf(
        __('Thank you for your review! It is now live on our website: %s', 'mebl-review-bridge'),
        get_permalink($product_id)
    );

    wp_mail($to, $subject, $message);
}, 10, 2);
```

**Filter Hooks (for customization):**

```php
// Modify review validation rules
apply_filters('mebl_review_min_length', 10);
apply_filters('mebl_review_max_length', 5000);
apply_filters('mebl_review_rate_limit', 5); // Max reviews per hour

// Modify auto-approval rules (default: all pending)
apply_filters('mebl_review_auto_approve', false, $user_id, $product_id);

// Modify verified purchase logic
apply_filters('mebl_review_verified_purchase', $verified, $user_id, $product_id);

// Customize GraphQL response
apply_filters('mebl_review_graphql_response', $review_data, $comment);
```

### 4.3 Plugin Deployment Procedures

#### Deployment Checklist

**Pre-Deployment (Development Environment):**

1. ✅ Test plugin activation/deactivation
2. ✅ Verify GraphQL schema in GraphiQL (`/graphql`)
3. ✅ Test review submission with authenticated user
4. ✅ Test moderation workflow in WordPress admin
5. ✅ Verify cache updates when reviews approved
6. ✅ Check database indexes created successfully
7. ✅ Test error handling (invalid inputs, duplicate reviews)
8. ✅ Verify email notifications (if enabled)

**Deployment Methods:**

#### Option A: Manual Upload (Recommended for First Deploy)

```bash
# 1. Create deployment package
cd wordpress/mebl-review-bridge/
zip -r mebl-review-bridge-v1.0.0.zip . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "*.log"

# 2. Upload to home.pl
# Navigate to: https://wordpress2533583.home.pl/wp-admin/plugin-install.php?tab=upload
# Upload: mebl-review-bridge-v1.0.0.zip

# 3. Activate plugin
# Navigate to: Plugins → Installed Plugins → Activate "MEBL Review Bridge"
```

#### Option B: FTP/SFTP Deployment

```bash
# Using lftp or FileZilla
lftp -u username,password ftp.home.pl <<EOF
cd /domains/yourdomain.com/public_html/wp-content/plugins/
mirror -R wordpress/mebl-review-bridge/ mebl-review-bridge/
bye
EOF

# Then activate via WordPress admin
```

#### Option C: Git Deployment (If SSH Access Available)

```bash
# SSH into home.pl server
ssh user@wordpress2533583.home.pl

# Navigate to plugins directory
cd /path/to/wordpress/wp-content/plugins/

# Clone or pull repository
git clone https://github.com/szpeqq/mebl.git mebl-repo
ln -s mebl-repo/wordpress/mebl-review-bridge mebl-review-bridge

# Activate via WP-CLI (if available)
wp plugin activate mebl-review-bridge
```

**Post-Deployment Verification:**

```bash
# 1. Check plugin is active
curl -s https://wordpress2533583.home.pl/wp-admin/plugins.php | grep "mebl-review-bridge"

# 2. Test GraphQL endpoint
curl -X POST https://wordpress2533583.home.pl/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { products(first: 1) { nodes { reviewsAllowed reviewCount } } }"
  }'

# Expected response: {"data":{"products":{"nodes":[{...}]}}}

# 3. Test review submission (requires authentication)
# Use Postman or Insomnia with JWT token
```

#### Configuration Steps (WordPress Admin)

**1. Enable WooCommerce Reviews:**

```
WordPress Admin → WooCommerce → Settings → Products → General
☑ Enable reviews
☑ Show "verified owner" label
☑ Reviews can only be left by "verified owners" (optional)
Save changes
```

**2. Configure Comment Moderation:**

```
WordPress Admin → Settings → Discussion
☑ Comment must be manually approved
☑ Enable threaded comments (2 levels) - for seller responses
☐ Automatically close comments on articles older than X days (disable for products)
Save changes
```

**3. Set Product-Level Settings (if needed):**

```
WordPress Admin → Products → [Edit Product] → Advanced tab
☑ Enable reviews
Save product
```

**4. Test Moderation Queue:**

```
WordPress Admin → Comments
Filter by: "Product Reviews"
Verify custom columns show: Rating, Verified
Test bulk actions: Approve Reviews, Mark as Spam
```

### 4.4 Testing Strategies

#### Unit Tests (PHP)

**File: `tests/test-review-validation.php` (PHPUnit)**

```php
<?php
class Test_Review_Validation extends WP_UnitTestCase {

    public function test_requires_authentication() {
        // Logout current user
        wp_set_current_user(0);

        $result = MEBL_Review_Validation::validate_submission([
            'productId' => 1,
            'rating' => 5,
            'content' => 'Great product!',
        ], null);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('logged in', $result['message']);
    }

    public function test_validates_rating_range() {
        $user_id = $this->factory->user->create();
        wp_set_current_user($user_id);

        $product_id = $this->factory->post->create(['post_type' => 'product']);

        // Test invalid rating
        $result = MEBL_Review_Validation::validate_submission([
            'productId' => $product_id,
            'rating' => 6, // Invalid
            'content' => 'Great product!',
        ], null);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('1 and 5', $result['message']);
    }

    public function test_prevents_duplicate_reviews() {
        $user_id = $this->factory->user->create();
        wp_set_current_user($user_id);

        $product_id = $this->factory->post->create(['post_type' => 'product']);

        // Create existing review
        $this->factory->comment->create([
            'comment_post_ID' => $product_id,
            'user_id' => $user_id,
            'comment_type' => 'review',
        ]);

        // Attempt duplicate
        $result = MEBL_Review_Validation::validate_submission([
            'productId' => $product_id,
            'rating' => 5,
            'content' => 'Great product!',
        ], null);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('already reviewed', $result['message']);
    }
}
```

#### Integration Tests (GraphQL)

**File: `tests/test-graphql-reviews.php`**

```php
<?php
class Test_GraphQL_Reviews extends WP_UnitTestCase {

    public function test_query_product_reviews() {
        // Create product
        $product_id = $this->factory->post->create(['post_type' => 'product']);

        // Create approved review
        $comment_id = $this->factory->comment->create([
            'comment_post_ID' => $product_id,
            'comment_type' => 'review',
            'comment_approved' => 1,
        ]);
        update_comment_meta($comment_id, 'rating', 5);
        update_comment_meta($comment_id, 'verified', '1');

        // Query via GraphQL
        $query = '
            query GetReviews($id: Int!) {
                product(id: $id, idType: DATABASE_ID) {
                    reviewCount
                    averageRating
                    reviews(first: 10) {
                        edges {
                            node {
                                id
                                rating
                                verified
                            }
                        }
                    }
                }
            }
        ';

        $response = graphql([
            'query' => $query,
            'variables' => ['id' => $product_id],
        ]);

        $this->assertArrayNotHasKey('errors', $response);
        $this->assertEquals(1, $response['data']['product']['reviewCount']);
        $this->assertEquals(5.0, $response['data']['product']['averageRating']);
    }

    public function test_submit_review_mutation() {
        // Create authenticated user
        $user_id = $this->factory->user->create();
        wp_set_current_user($user_id);

        $product_id = $this->factory->post->create(['post_type' => 'product']);

        // Enable reviews
        wp_update_post([
            'ID' => $product_id,
            'comment_status' => 'open',
        ]);

        $mutation = '
            mutation SubmitReview($input: SubmitReviewInput!) {
                submitReview(input: $input) {
                    success
                    message
                }
            }
        ';

        $response = graphql([
            'query' => $mutation,
            'variables' => [
                'input' => [
                    'productId' => $product_id,
                    'rating' => 5,
                    'content' => 'Excellent product, highly recommend!',
                ],
            ],
        ]);

        $this->assertArrayNotHasKey('errors', $response);
        $this->assertTrue($response['data']['submitReview']['success']);
    }
}
```

#### Manual Testing Checklist

**Functional Testing:**

- [ ] Submit review as authenticated user → Success
- [ ] Submit review as guest → Error: "Must be logged in"
- [ ] Submit review with rating < 1 → Error: "Rating must be 1-5"
- [ ] Submit review with rating > 5 → Error: "Rating must be 1-5"
- [ ] Submit review with < 10 characters → Error: "Too short"
- [ ] Submit duplicate review → Error: "Already reviewed"
- [ ] Submit 6 reviews in 1 hour → Error: "Rate limit"
- [ ] Approve review in admin → Average rating updates
- [ ] Delete approved review → Average rating recalculates
- [ ] Verify purchase → Verified badge shows
- [ ] No purchase history → No verified badge

**Admin UI Testing:**

- [ ] Custom columns (Rating, Verified) display correctly
- [ ] Filter dropdown shows "Product Reviews" option
- [ ] Bulk approve reviews → Cache updates
- [ ] Edit rating in meta box → Saves correctly
- [ ] "View Product" link navigates to correct product

**GraphQL Testing:**

- [ ] Query product reviews → Returns paginated list
- [ ] Query with orderBy=RECENT → Sorted by date DESC
- [ ] Query with first=20 → Returns 20 reviews
- [ ] Query with after=[cursor] → Returns next page
- [ ] Mutation submitReview → Creates pending review
- [ ] Query averageRating → Returns cached value
- [ ] Query ratingHistogram → Returns distribution

### 4.5 Backward Compatibility

**WooCommerce Native Reviews:**

The plugin is designed to work with existing WooCommerce reviews. No data migration is required if you're already using WooCommerce's built-in review system.

**Compatibility Matrix:**

| Component   | Minimum Version | Tested Up To | Notes                                   |
| ----------- | --------------- | ------------ | --------------------------------------- |
| WordPress   | 6.0             | 6.7          | Uses modern comment APIs                |
| WooCommerce | 8.0             | 9.5          | Requires `wc_customer_bought_product()` |
| WPGraphQL   | 1.20            | 1.28         | Schema registration v4 API              |
| PHP         | 7.4             | 8.3          | Uses type hints, null coalescing        |
| MySQL       | 5.7             | 8.0          | Requires JSON functions                 |

**Deprecation Strategy:**

If field names change in future versions, use GraphQL field deprecation:

```php
register_graphql_field('Product', 'reviewCount', [
    'type' => 'Int',
    'deprecationReason' => 'Use reviews.totalCount instead',
    'resolve' => function($product) {
        return (int) get_post_meta($product->databaseId, '_wc_review_count', true);
    },
]);
```

### 4.6 Logging and Debugging

**Error Logging:**

```php
/**
 * Log review-related errors to WordPress debug log
 */
function mebl_log_error($message, $context = []) {
    if (!defined('WP_DEBUG') || !WP_DEBUG) {
        return;
    }

    $log_entry = sprintf(
        '[MEBL Review Bridge] %s | Context: %s',
        $message,
        json_encode($context)
    );

    error_log($log_entry);
}

// Usage in mutation resolver:
if (!$comment_id) {
    mebl_log_error('Failed to insert comment', [
        'product_id' => $product_id,
        'user_id' => $user->ID,
        'error' => $wpdb->last_error,
    ]);
}
```

**Query Performance Monitoring:**

```php
/**
 * Log slow GraphQL queries
 */
add_filter('graphql_response', function($response, $schema, $operation, $query) {
    if (defined('SAVEQUERIES') && SAVEQUERIES) {
        global $wpdb;

        $slow_queries = array_filter($wpdb->queries, function($query) {
            return $query[1] > 0.1; // Queries taking > 100ms
        });

        if (!empty($slow_queries)) {
            mebl_log_error('Slow GraphQL queries detected', [
                'operation' => $operation,
                'query_count' => count($slow_queries),
            ]);
        }
    }

    return $response;
}, 10, 4);
```

**Debug Mode:**

```php
// Add to wp-config.php for verbose logging
define('MEBL_REVIEW_DEBUG', true);

// In plugin code:
if (defined('MEBL_REVIEW_DEBUG') && MEBL_REVIEW_DEBUG) {
    mebl_log_error('Review cache updated', [
        'product_id' => $product_id,
        'average' => $average,
        'count' => $count,
    ]);
}
```

### 4.7 Plugin Updates and Versioning

**Semantic Versioning:**

- **v1.0.0** — Initial release (MVP features)
- **v1.1.0** — Add helpful/upvote feature (Phase 2)
- **v1.2.0** — Add review sorting options (Phase 2)
- **v2.0.0** — Breaking changes (e.g., schema redesign)

**Update Hook (Database Schema Changes):**

```php
/**
 * Handle plugin updates
 */
add_action('plugins_loaded', function() {
    $current_version = get_option('mebl_review_bridge_version', '0.0.0');

    if (version_compare($current_version, MEBL_REVIEW_BRIDGE_VERSION, '<')) {
        mebl_review_bridge_update($current_version);
        update_option('mebl_review_bridge_version', MEBL_REVIEW_BRIDGE_VERSION);
    }
});

function mebl_review_bridge_update($old_version) {
    global $wpdb;

    // Example: Add new index in v1.1.0
    if (version_compare($old_version, '1.1.0', '<')) {
        $wpdb->query("
            CREATE INDEX IF NOT EXISTS idx_mebl_helpful_reviews
            ON {$wpdb->commentmeta}(meta_key, meta_value)
            WHERE meta_key = 'helpful'
        ");
    }

    // Example: Migrate data in v2.0.0
    if (version_compare($old_version, '2.0.0', '<')) {
        // Run data migration script
    }
}
```

**Rollback Procedure:**

```bash
# If update fails, rollback to previous version
cd /wp-content/plugins/
mv mebl-review-bridge mebl-review-bridge-broken
unzip mebl-review-bridge-v1.0.0-backup.zip
wp plugin activate mebl-review-bridge
```

---

**End of Part 4**

✅ WordPress admin UI customization detailed  
✅ Custom hooks and actions documented  
✅ Deployment procedures specified  
✅ Testing strategies defined (unit, integration, manual)  
✅ Backward compatibility addressed  
✅ Logging and debugging patterns established  
✅ Update and versioning strategy documented

---

## Part 5: Frontend Integration and SSR/SEO Considerations

### 5.1 React Component Architecture

**Component Hierarchy:**

```
ProductPage (src/pages/product/[slug].tsx)
  └── ProductReviews.component.tsx
        ├── ReviewSummary.component.tsx
        │     ├── StarRating.component.tsx
        │     └── RatingHistogram.component.tsx
        ├── ReviewList.component.tsx
        │     └── ReviewCard.component.tsx
        │           ├── StarRating.component.tsx
        │           └── VerifiedBadge.component.tsx
        └── ReviewForm.component.tsx
              ├── StarRatingInput.component.tsx
              └── TextAreaInput.component.tsx
```

### 5.2 Component Implementation

#### Star Rating Component (Reusable)

**File: `src/components/Product/StarRating.component.tsx`**

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // 0-5, supports decimals (e.g., 4.5)
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const filled = Math.min(Math.max(rating - (i - 1), 0), 1);

      stars.push(
        <div key={i} className="relative inline-block">
          {/* Empty star background */}
          <svg
            className={cn(sizeClasses[size], 'text-gray-300')}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          {/* Filled star overlay */}
          {filled > 0 && (
            <svg
              className={cn(
                sizeClasses[size],
                'absolute top-0 left-0 text-yellow-400'
              )}
              style={{ clipPath: `inset(0 ${(1 - filled) * 100}% 0 0)` }}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </div>
      );
    }
    return stars;
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex" role="img" aria-label={`${rating} out of ${maxRating} stars`}>
        {renderStars()}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
```

#### Review Summary Component

**File: `src/components/Product/ReviewSummary.component.tsx`**

```typescript
import React from 'react';
import { StarRating } from './StarRating.component';
import { RatingHistogram } from '@/types/review';
import { TypographyH3, TypographyP } from '@/components/ui/Typography.component';

interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
  ratingHistogram?: RatingHistogram | null;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  reviewCount,
  ratingHistogram,
}) => {
  const renderHistogram = () => {
    if (!ratingHistogram) return null;

    const ratings = [
      { stars: 5, count: ratingHistogram.fiveStar },
      { stars: 4, count: ratingHistogram.fourStar },
      { stars: 3, count: ratingHistogram.threeStar },
      { stars: 2, count: ratingHistogram.twoStar },
      { stars: 1, count: ratingHistogram.oneStar },
    ];

    const maxCount = Math.max(...ratings.map((r) => r.count));

    return (
      <div className="space-y-2">
        {ratings.map(({ stars, count }) => {
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-12">
                {stars} star{stars !== 1 ? 's' : ''}
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                  aria-label={`${count} ${stars}-star reviews`}
                />
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <div className="flex items-start gap-8">
        {/* Left: Overall Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="lg" />
          <TypographyP className="text-sm text-gray-600 mt-2">
            Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </TypographyP>
        </div>

        {/* Right: Histogram */}
        {ratingHistogram && (
          <div className="flex-1">
            <TypographyH3 className="text-lg mb-4">Rating Distribution</TypographyH3>
            {renderHistogram()}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### Review Card Component

**File: `src/components/Product/ReviewCard.component.tsx`**

```typescript
import React from 'react';
import { ProductReview } from '@/types/review';
import { StarRating } from './StarRating.component';
import { TypographyP } from '@/components/ui/Typography.component';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface ReviewCardProps {
  review: ProductReview;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="border-b py-6 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{review.author}</span>
            {review.verified && (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <time
          dateTime={review.date}
          className="text-sm text-gray-500"
        >
          {formatDate(review.date)}
        </time>
      </div>

      {/* Content */}
      <TypographyP className="text-gray-700 whitespace-pre-line">
        {review.content}
      </TypographyP>

      {/* Footer (Helpful votes - Phase 2) */}
      {review.helpful && review.helpful > 0 && (
        <div className="mt-3 text-sm text-gray-500">
          {review.helpful} {review.helpful === 1 ? 'person' : 'people'} found this helpful
        </div>
      )}
    </article>
  );
};
```

#### Review List Component with Pagination

**File: `src/components/Product/ReviewList.component.tsx`**

```typescript
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';
import { ReviewCard } from './ReviewCard.component';
import { ProductReview, ReviewOrderBy } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReviewListProps {
  productSlug: string;
  initialReviews?: ProductReview[];
  initialHasMore?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  productSlug,
  initialReviews = [],
  initialHasMore = false,
}) => {
  const [orderBy, setOrderBy] = useState<ReviewOrderBy>(ReviewOrderBy.RECENT);

  const { data, loading, error, fetchMore } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: {
      slug: productSlug,
      first: 10,
      orderBy,
    },
    skip: initialReviews.length === 0, // Skip if SSR data available
  });

  const reviews = data?.product?.reviews?.edges?.map((edge: any) => edge.node) || initialReviews;
  const pageInfo = data?.product?.reviews?.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? initialHasMore;

  const handleLoadMore = () => {
    if (!pageInfo?.endCursor) return;

    fetchMore({
      variables: {
        after: pageInfo.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          product: {
            ...prev.product,
            reviews: {
              ...fetchMoreResult.product.reviews,
              edges: [
                ...prev.product.reviews.edges,
                ...fetchMoreResult.product.reviews.edges,
              ],
            },
          },
        };
      },
    });
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load reviews. Please try again.
      </div>
    );
  }

  if (reviews.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Showing {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </div>
        <Select
          value={orderBy}
          onValueChange={(value) => setOrderBy(value as ReviewOrderBy)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ReviewOrderBy.RECENT}>Most Recent</SelectItem>
            <SelectItem value={ReviewOrderBy.HIGHEST_RATED}>Highest Rated</SelectItem>
            <SelectItem value={ReviewOrderBy.MOST_HELPFUL}>Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Review Cards */}
      <div className="space-y-0">
        {reviews.map((review: ProductReview) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && !loading && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
          >
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
};
```

#### Review Form Component

**File: `src/components/Product/ReviewForm.component.tsx`**

```typescript
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SUBMIT_REVIEW } from '@/utils/gql/SUBMIT_REVIEW';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: number;
  productSlug: string;
  isAuthenticated: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productSlug,
  isAuthenticated,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const [submitReview, { loading }] = useMutation(SUBMIT_REVIEW, {
    refetchQueries: [
      { query: GET_PRODUCT_REVIEWS, variables: { slug: productSlug } },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating.',
        variant: 'destructive',
      });
      return;
    }

    if (content.trim().length < 10) {
      toast({
        title: 'Review Too Short',
        description: 'Please write at least 10 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data } = await submitReview({
        variables: {
          input: {
            productId,
            rating,
            content: content.trim(),
          },
        },
      });

      if (data?.submitReview?.success) {
        setSubmitted(true);
        setRating(0);
        setContent('');
        toast({
          title: 'Review Submitted',
          description: data.submitReview.message,
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: data?.submitReview?.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You must be <a href="/login" className="underline">logged in</a> to submit a review.
        </AlertDescription>
      </Alert>
    );
  }

  if (submitted) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Thank you! Your review has been submitted and is awaiting moderation.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6 bg-gray-50">
      {/* Star Rating Input */}
      <div>
        <Label htmlFor="rating" className="block mb-2">
          Your Rating <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-colors',
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            You rated this product {rating} {rating === 1 ? 'star' : 'stars'}
          </p>
        )}
      </div>

      {/* Review Content */}
      <div>
        <Label htmlFor="content" className="block mb-2">
          Your Review <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={6}
          maxLength={5000}
          className="resize-none"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {content.length} / 5000 characters
          {content.length < 10 && content.length > 0 && (
            <span className="text-red-500 ml-2">
              (Minimum 10 characters)
            </span>
          )}
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || rating === 0 || content.trim().length < 10}
        className="w-full"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};
```

#### Main Product Reviews Component

**File: `src/components/Product/ProductReviews.component.tsx`**

```typescript
import React from 'react';
import { Product } from '@/types/product';
import { ReviewSummary } from './ReviewSummary.component';
import { ReviewList } from './ReviewList.component';
import { ReviewForm } from './ReviewForm.component';
import { TypographyH2 } from '@/components/ui/Typography.component';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductReviewsProps {
  product: Product;
  isAuthenticated: boolean;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  product,
  isAuthenticated,
}) => {
  if (!product.reviewsAllowed) {
    return null;
  }

  const hasReviews = product.reviewCount > 0;

  return (
    <section className="mt-16" id="reviews">
      <TypographyH2 className="mb-6">Customer Reviews</TypographyH2>

      {/* Review Summary */}
      {hasReviews && product.averageRating && (
        <ReviewSummary
          averageRating={product.averageRating}
          reviewCount={product.reviewCount}
          ratingHistogram={product.ratingHistogram}
        />
      )}

      <Separator className="my-8" />

      {/* Tabs: Reviews List / Write Review */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="reviews">
            All Reviews ({product.reviewCount})
          </TabsTrigger>
          <TabsTrigger value="write">Write a Review</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          <ReviewList
            productSlug={product.slug}
            initialReviews={product.reviews?.edges?.map((edge) => edge.node) || []}
            initialHasMore={product.reviews?.pageInfo?.hasNextPage}
          />
        </TabsContent>

        <TabsContent value="write" className="mt-6">
          <ReviewForm
            productId={product.databaseId}
            productSlug={product.slug}
            isAuthenticated={isAuthenticated}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
};
```

### 5.3 Product Page Integration with SSR

**File: `src/pages/product/[slug].tsx`**

```typescript
import { GetServerSideProps } from 'next';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { initializeApollo } from '@/utils/apollo/ApolloClient';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';
import { Product } from '@/types/product';
import { ProductReviews } from '@/components/Product/ProductReviews.component';
import { Layout } from '@/components/Layout/Layout.component';
import { SingleProduct } from '@/components/Product/SingleProduct.component';
import { BreadcrumbNav } from '@/components/Layout/BreadcrumbNav.component';
import { getAuthToken } from '@/utils/auth';

interface ProductPageProps {
  product: Product;
  isAuthenticated: boolean;
}

export default function ProductPage({ product, isAuthenticated }: ProductPageProps) {
  return (
    <Layout>
      <BreadcrumbNav
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: product.name },
        ]}
      />

      <SingleProduct product={product} />

      {/* Review Section (SEO-optimized, SSR) */}
      <ProductReviews product={product} isAuthenticated={isAuthenticated} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };
  const apolloClient: ApolloClient<NormalizedCacheObject> = initializeApollo();

  try {
    // Fetch product with reviews
    const { data } = await apolloClient.query({
      query: GET_PRODUCT_REVIEWS,
      variables: {
        slug,
        first: 10, // Initial page of reviews
      },
    });

    if (!data?.product) {
      return { notFound: true };
    }

    // Check authentication status
    const token = getAuthToken(context.req);
    const isAuthenticated = !!token;

    return {
      props: {
        product: data.product,
        isAuthenticated,
        // Apollo cache serialization for client hydration
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  } catch (error) {
    console.error('Product page error:', error);
    return { notFound: true };
  }
};
```

### 5.4 SEO Optimization

#### Structured Data (JSON-LD)

**File: `src/components/Product/ProductStructuredData.component.tsx`**

```typescript
import React from 'react';
import Head from 'next/head';
import { Product } from '@/types/product';

interface ProductStructuredDataProps {
  product: Product;
  reviews?: any[]; // First page of reviews for schema
}

export const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({
  product,
  reviews = [],
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image?.sourceUrl,
    description: product.description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: `https://yourdomain.com/product/${product.slug}`,
      priceCurrency: 'PLN',
      price: parseFloat(product.price?.replace(/[^\d.]/g, '') || '0'),
      availability: product.stockStatus === 'IN_STOCK'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  // Add aggregate rating if reviews exist
  if (product.averageRating && product.reviewCount > 0) {
    structuredData['aggregateRating'] = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add individual reviews (first 5 for schema)
  if (reviews.length > 0) {
    structuredData['review'] = reviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewBody: review.content,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }));
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
};
```

**Integration in Product Page:**

```typescript
// In ProductPage component
<ProductStructuredData
  product={product}
  reviews={product.reviews?.edges?.map((edge) => edge.node)}
/>
```

#### Meta Tags for Social Sharing

```typescript
// In ProductPage component (Head section)
<Head>
  <title>{product.name} - Customer Reviews</title>
  <meta name="description" content={`Read ${product.reviewCount} customer reviews for ${product.name}. Average rating: ${product.averageRating?.toFixed(1)}/5.`} />

  {/* Open Graph */}
  <meta property="og:title" content={product.name} />
  <meta property="og:description" content={product.description} />
  <meta property="og:image" content={product.image?.sourceUrl} />
  <meta property="og:type" content="product" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={product.name} />
  <meta name="twitter:description" content={product.description} />
  <meta name="twitter:image" content={product.image?.sourceUrl} />
</Head>
```

### 5.5 Apollo Client Configuration

**Update: `src/utils/apollo/ApolloClient.js`**

```javascript
import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

// Error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Path: ${path}`);
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP link
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  credentials: 'include',
});

// Auth middleware (existing)
const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== 'undefined' ? sessionStorage.getItem('auth-token') : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Cache configuration with review-specific policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        product: {
          // Cache products by slug
          keyArgs: ['id', 'idType'],
        },
      },
    },
    Product: {
      fields: {
        reviews: {
          // Merge paginated reviews
          keyArgs: ['orderBy'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;

            // If cursor changed, append new edges
            if (args?.after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            }

            // Otherwise, replace (e.g., sort order changed)
            return incoming;
          },
        },
        averageRating: {
          // Always read fresh average rating (critical data)
          read(cached) {
            return cached;
          },
        },
      },
    },
  },
});

export function initializeApollo(initialState = null) {
  const client = new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, authLink, httpLink]),
    cache,
  });

  // Restore cache from SSR
  if (initialState) {
    client.cache.restore(initialState);
  }

  return client;
}
```

### 5.6 Accessibility Patterns

**ARIA Labels and Roles:**

```typescript
// Star rating component
<div role="img" aria-label={`${rating} out of 5 stars`}>
  {renderStars()}
</div>

// Review form
<form onSubmit={handleSubmit} aria-label="Submit product review">
  <Label htmlFor="rating">
    Your Rating <span aria-label="required">*</span>
  </Label>

  <button
    type="button"
    onClick={() => setRating(star)}
    aria-label={`Rate ${star} stars`}
    aria-pressed={star <= rating}
  >
    <Star />
  </button>
</form>

// Review list
<section aria-labelledby="reviews-heading">
  <h2 id="reviews-heading">Customer Reviews</h2>
  {reviews.map((review) => (
    <article key={review.id} aria-label={`Review by ${review.author}`}>
      {/* Review content */}
    </article>
  ))}
</section>
```

**Keyboard Navigation:**

```typescript
// Star rating input with keyboard support
const handleKeyDown = (e: React.KeyboardEvent, star: number) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setRating(star);
  }

  // Arrow key navigation
  if (e.key === 'ArrowRight' && star < 5) {
    setRating(star + 1);
  }
  if (e.key === 'ArrowLeft' && star > 1) {
    setRating(star - 1);
  }
};

<button
  type="button"
  onClick={() => setRating(star)}
  onKeyDown={(e) => handleKeyDown(e, star)}
  tabIndex={0}
>
  <Star />
</button>
```

**Screen Reader Announcements:**

```typescript
import { useEffect } from 'react';

// Announce review submission success
useEffect(() => {
  if (submitted) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Your review has been submitted successfully.';
    document.body.appendChild(announcement);

    setTimeout(() => document.body.removeChild(announcement), 1000);
  }
}, [submitted]);
```

### 5.7 Performance Optimization

**Lazy Loading Components:**

```typescript
// In product page
import dynamic from 'next/dynamic';

const ProductReviews = dynamic(
  () => import('@/components/Product/ProductReviews.component').then((mod) => mod.ProductReviews),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true, // Enable SSR for SEO
  }
);
```

**Image Optimization:**

```typescript
import Image from 'next/image';

// In review card (if image uploads in Phase 2)
<Image
  src={review.imageUrl}
  alt={`Review image by ${review.author}`}
  width={150}
  height={150}
  loading="lazy"
  placeholder="blur"
/>
```

**Debounced Review Fetching:**

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    refetch({ search: debouncedSearch });
  }
}, [debouncedSearch, refetch]);
```

### 5.8 User Experience Flows

**Flow 1: First-Time Reviewer**

```
1. User views product page
2. Scrolls to reviews section (anchor link from header)
3. Sees "Write a Review" tab
4. Clicks tab → Review form appears
5. Selects star rating (hover preview)
6. Types review text (character counter updates)
7. Clicks "Submit Review"
8. Success message: "Thank you! Awaiting moderation"
9. Form resets, switches to "All Reviews" tab
```

**Flow 2: Returning Customer (Already Reviewed)**

```
1. User attempts to submit second review
2. GraphQL mutation validation fails
3. Error toast: "You have already reviewed this product"
4. Form remains visible but submit button disabled
5. User can view their existing review in list
```

**Flow 3: Guest User**

```
1. Guest views product page
2. Sees reviews list (public)
3. Clicks "Write a Review" tab
4. Alert banner: "You must be logged in to submit a review"
5. Click "logged in" link → Redirects to /login?redirect=/product/slug
6. After login → Returns to product page
7. Review form now accessible
```

**Flow 4: Review Moderation**

```
1. Admin receives email notification (optional)
2. Logs into WordPress admin
3. Navigates to Comments → Filter: "Product Reviews"
4. Sees pending reviews with rating/verified columns
5. Bulk selects reviews → "Approve Reviews"
6. Product cache auto-updates (average rating recalculated)
7. Frontend users see new reviews on next page load
```

---

**End of Part 5**

✅ React component architecture defined  
✅ Complete component implementations (StarRating, ReviewCard, ReviewForm, etc.)  
✅ Product page SSR integration documented  
✅ SEO optimization (structured data, meta tags) implemented  
✅ Apollo Client cache policies configured  
✅ Accessibility patterns established (ARIA, keyboard nav, screen readers)  
✅ Performance optimizations specified (lazy loading, debouncing)  
✅ User experience flows mapped

---

## Part 6: Moderation, Security, and Abuse Prevention

### 6.1 Moderation Workflows

#### Approval Process

**Default Flow: Manual Moderation**

```
Review Submitted (comment_approved='0')
    ↓
WordPress Admin Notification
    ↓
Admin Reviews Comment in Dashboard
    ↓
Decision Point:
    ├── Approve → comment_approved='1' → Public display + cache update
    ├── Reject → comment_approved='trash' → Hidden from public
    └── Mark Spam → comment_approved='spam' → Spam database + training
```

**Auto-Approval Rules (Optional):**

```php
/**
 * Auto-approve reviews from trusted users
 * Add to plugin or functions.php
 */
add_filter('mebl_review_auto_approve', function($auto_approve, $user_id, $product_id) {
    // Auto-approve if user has 3+ approved reviews
    $approved_count = get_comments([
        'user_id' => $user_id,
        'status' => 'approve',
        'type' => 'review',
        'count' => true,
    ]);

    if ($approved_count >= 3) {
        return true;
    }

    // Auto-approve verified purchases (optional - higher trust)
    $verified = wc_customer_bought_product(
        get_userdata($user_id)->user_email,
        $user_id,
        $product_id
    );

    if ($verified) {
        return true; // Or keep manual for quality control
    }

    return $auto_approve;
}, 10, 3);

// Apply filter in mutation resolver
$auto_approve = apply_filters('mebl_review_auto_approve', false, $user_id, $product_id);
$comment_data['comment_approved'] = $auto_approve ? 1 : 0;
```

#### Moderation Queue Management

**Priority System:**

```php
/**
 * Sort moderation queue by priority
 */
add_filter('comments_clauses', function($clauses, $query) {
    global $wpdb;

    // Only apply to moderation queue
    if (!is_admin() || $query->query_vars['status'] !== 'hold') {
        return $clauses;
    }

    // Priority: Verified purchases first, then by date
    $clauses['join'] .= " LEFT JOIN {$wpdb->commentmeta} AS cm_verified
        ON {$wpdb->comments}.comment_ID = cm_verified.comment_id
        AND cm_verified.meta_key = 'verified'";

    $clauses['orderby'] = "cm_verified.meta_value DESC, {$wpdb->comments}.comment_date_gmt DESC";

    return $clauses;
}, 10, 2);
```

**Bulk Moderation Tools:**

```php
/**
 * Quick approve/reject actions in admin
 */
add_action('admin_footer-edit-comments.php', function() {
    ?>
    <script>
    jQuery(document).ready(function($) {
        // Add quick action buttons
        $('.comment-item').each(function() {
            var commentId = $(this).find('.check-column input').val();
            var actions = $(this).find('.row-actions');

            // Add "Quick Approve" button
            actions.append(' | <a href="#" class="quick-approve" data-id="' + commentId + '">Quick Approve</a>');
        });

        // Handle quick approve
        $('.quick-approve').on('click', function(e) {
            e.preventDefault();
            var commentId = $(this).data('id');

            $.post(ajaxurl, {
                action: 'mebl_quick_approve_review',
                comment_id: commentId,
                nonce: '<?php echo wp_create_nonce('mebl_quick_approve'); ?>'
            }, function(response) {
                if (response.success) {
                    location.reload();
                }
            });
        });
    });
    </script>
    <?php
});

// AJAX handler
add_action('wp_ajax_mebl_quick_approve_review', function() {
    check_ajax_referer('mebl_quick_approve', 'nonce');

    if (!current_user_can('moderate_comments')) {
        wp_send_json_error('Permission denied');
    }

    $comment_id = intval($_POST['comment_id']);
    wp_set_comment_status($comment_id, 'approve');

    wp_send_json_success();
});
```

#### Moderation Guidelines (Documentation)

**Create: `wordpress/mebl-review-bridge/MODERATION_GUIDELINES.md`**

```markdown
# Review Moderation Guidelines

## Approve Reviews That:

- ✅ Provide genuine product feedback (positive or negative)
- ✅ Are written in complete sentences
- ✅ Mention specific product features
- ✅ Come from verified purchases (prioritize)
- ✅ Are respectful and constructive

## Reject Reviews That:

- ❌ Contain profanity or hate speech
- ❌ Include personal information (phone numbers, addresses)
- ❌ Are promotional or contain URLs
- ❌ Are duplicate submissions
- ❌ Are off-topic or about shipping/customer service (not product)
- ❌ Violate copyright (copied from other sites)

## Mark as Spam:

- 🚫 Generic text ("Great product!", "Highly recommend!")
- 🚫 Bot-generated content
- 🚫 Gibberish or random characters
- 🚫 Repeated submissions from same user

## Editing Reviews:

- Minor typo fixes: ✅ Allowed
- Content changes: ❌ Not allowed (approve or reject as-is)
- Rating changes: ⚠️ Only if obviously incorrect (e.g., 1-star with glowing review)
```

### 6.2 Security Measures

#### Input Sanitization

**Backend (PHP):**

```php
/**
 * Enhanced sanitization in mutation resolver
 */
private static function submit_review_mutation($input, $context) {
    // ... authentication checks ...

    // Sanitize content (allow basic HTML, strip scripts)
    $allowed_tags = [
        'p' => [],
        'br' => [],
        'strong' => [],
        'em' => [],
        'ul' => [],
        'ol' => [],
        'li' => [],
    ];

    $content = wp_kses($input['content'], $allowed_tags);
    $content = sanitize_textarea_field($content); // Remove line breaks if needed

    // Strip any remaining HTML entities that could be XSS vectors
    $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');

    // Validate rating is integer (prevent type juggling attacks)
    $rating = filter_var($input['rating'], FILTER_VALIDATE_INT);
    if ($rating === false || $rating < 1 || $rating > 5) {
        return [
            'success' => false,
            'message' => __('Invalid rating value.', 'mebl-review-bridge'),
            'review' => null,
        ];
    }

    // Validate product ID (prevent SQL injection)
    $product_id = absint($input['productId']);
    if ($product_id === 0) {
        return [
            'success' => false,
            'message' => __('Invalid product ID.', 'mebl-review-bridge'),
            'review' => null,
        ];
    }

    // ... rest of mutation logic ...
}
```

**Frontend (TypeScript):**

```typescript
/**
 * Client-side validation before submission
 */
const sanitizeReviewContent = (content: string): string => {
  // Remove HTML tags
  const stripped = content.replace(/<[^>]*>/g, '');

  // Remove URLs
  const noUrls = stripped.replace(/https?:\/\/[^\s]+/g, '[URL removed]');

  // Remove email addresses
  const noEmails = noUrls.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[Email removed]');

  // Remove phone numbers (simple pattern)
  const noPhones = noEmails.replace(
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,
    '[Phone removed]',
  );

  // Trim whitespace
  return noPhones.trim();
};

// In ReviewForm component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const sanitizedContent = sanitizeReviewContent(content);

  // Check for suspicious patterns
  if (
    sanitizedContent.includes('[URL removed]') ||
    sanitizedContent.includes('[Email removed]')
  ) {
    toast({
      title: 'Invalid Content',
      description:
        'Please remove URLs and contact information from your review.',
      variant: 'destructive',
    });
    return;
  }

  // ... submit mutation ...
};
```

#### SQL Injection Prevention

**WordPress Prepared Statements:**

```php
/**
 * All database queries use prepared statements
 */
global $wpdb;

// ✅ CORRECT: Prepared statement
$reviews = $wpdb->get_results($wpdb->prepare("
    SELECT c.*, cm.meta_value as rating
    FROM {$wpdb->comments} c
    INNER JOIN {$wpdb->commentmeta} cm ON c.comment_ID = cm.comment_id
    WHERE c.comment_post_ID = %d
      AND c.comment_approved = '1'
      AND cm.meta_key = 'rating'
    ORDER BY c.comment_date DESC
    LIMIT %d
", $product_id, $limit));

// ❌ WRONG: Direct interpolation (vulnerable)
$reviews = $wpdb->get_results("
    SELECT * FROM {$wpdb->comments}
    WHERE comment_post_ID = {$product_id}
");
```

#### CSRF Protection

**WordPress Nonces:**

```php
/**
 * CSRF protection for admin actions
 */
// In admin form
wp_nonce_field('mebl_review_rating_nonce', 'mebl_review_rating_nonce');

// In save handler
if (!isset($_POST['mebl_review_rating_nonce']) ||
    !wp_verify_nonce($_POST['mebl_review_rating_nonce'], 'mebl_review_rating_nonce')) {
    wp_die(__('Security check failed.', 'mebl-review-bridge'));
}
```

**GraphQL Mutations (JWT-based):**

```typescript
// Frontend: JWT token in headers (handled by Apollo middleware)
const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem('auth-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Backend: Validate JWT in mutation resolver
if (!$context->user || !$context->user->ID) {
    throw new \GraphQL\Error\UserError('Authentication required');
}
```

#### XSS Prevention

**Output Escaping:**

```php
// In GraphQL resolver - escape before returning
return [
    'id' => (string) $comment->comment_ID,
    'author' => esc_html($comment->comment_author),
    'content' => wp_kses_post($comment->comment_content), // Allow safe HTML
    'rating' => (int) get_comment_meta($comment->comment_ID, 'rating', true),
];
```

```typescript
// In React component - dangerouslySetInnerHTML avoided
<TypographyP className="text-gray-700 whitespace-pre-line">
  {review.content} {/* React auto-escapes */}
</TypographyP>

// If HTML needed (e.g., line breaks):
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(review.content, {
  ALLOWED_TAGS: ['br', 'p', 'strong', 'em'],
});

<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

### 6.3 Spam Prevention Strategies

#### Rate Limiting

**Backend Implementation:**

```php
/**
 * Rate limiting in validation class
 */
class MEBL_Review_Validation {

    /**
     * Check rate limits (5 reviews per hour per user)
     */
    public static function check_rate_limit($user_id) {
        $transient_key = 'mebl_review_rate_limit_' . $user_id;
        $review_count = get_transient($transient_key);

        if ($review_count === false) {
            // First review in this hour
            set_transient($transient_key, 1, HOUR_IN_SECONDS);
            return true;
        }

        if ($review_count >= 5) {
            return false; // Rate limit exceeded
        }

        // Increment counter
        set_transient($transient_key, $review_count + 1, HOUR_IN_SECONDS);
        return true;
    }

    /**
     * Check for duplicate content (copy-paste spam)
     */
    public static function check_duplicate_content($content, $user_id) {
        global $wpdb;

        // Hash content for comparison
        $content_hash = md5(strtolower(trim($content)));

        // Check if user submitted identical review recently
        $duplicate = $wpdb->get_var($wpdb->prepare("
            SELECT c.comment_ID
            FROM {$wpdb->comments} c
            WHERE c.user_id = %d
              AND c.comment_type = 'review'
              AND MD5(LOWER(TRIM(c.comment_content))) = %s
              AND c.comment_date > DATE_SUB(NOW(), INTERVAL 30 DAY)
            LIMIT 1
        ", $user_id, $content_hash));

        return $duplicate === null;
    }
}
```

#### Akismet Integration (WordPress Plugin)

```php
/**
 * Spam check using Akismet (optional)
 */
add_filter('mebl_review_before_insert', function($comment_data) {
    // Check if Akismet is active
    if (!function_exists('akismet_check_db_comment')) {
        return $comment_data;
    }

    // Prepare data for Akismet
    $akismet_data = [
        'comment_type' => 'review',
        'comment_author' => $comment_data['comment_author'],
        'comment_author_email' => $comment_data['comment_author_email'],
        'comment_content' => $comment_data['comment_content'],
        'user_ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
        'referrer' => $_SERVER['HTTP_REFERER'] ?? '',
    ];

    // Check spam status
    $is_spam = akismet_check_db_comment($akismet_data);

    if ($is_spam === true) {
        // Mark as spam automatically
        $comment_data['comment_approved'] = 'spam';
    }

    return $comment_data;
});
```

#### Honeypot Fields (Frontend)

```typescript
/**
 * Add honeypot field to review form (hidden from users, visible to bots)
 */
export const ReviewForm: React.FC<ReviewFormProps> = ({ ... }) => {
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If honeypot filled, likely a bot
    if (honeypot !== '') {
      console.log('Spam detected via honeypot');
      return; // Silent fail (don't alert bot)
    }

    // ... continue with submission ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot field (hidden with CSS, not display:none which bots detect) */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Real form fields */}
      {/* ... */}
    </form>
  );
};
```

#### CAPTCHA Integration (Phase 2)

```typescript
/**
 * Google reCAPTCHA v3 integration (optional)
 */
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const ReviewForm: React.FC<ReviewFormProps> = ({ ... }) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      console.log('reCAPTCHA not ready');
      return;
    }

    // Get reCAPTCHA token
    const token = await executeRecaptcha('submit_review');

    // Submit with token
    await submitReview({
      variables: {
        input: {
          productId,
          rating,
          content,
          recaptchaToken: token, // Add to input type
        },
      },
    });
  };

  // ... rest of component ...
};
```

**Backend Verification:**

```php
/**
 * Verify reCAPTCHA token (add to validation)
 */
private static function verify_recaptcha($token) {
    $secret = get_option('mebl_recaptcha_secret_key');

    if (empty($secret)) {
        return true; // Skip if not configured
    }

    $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
        'body' => [
            'secret' => $secret,
            'response' => $token,
        ],
    ]);

    if (is_wp_error($response)) {
        return false;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    // reCAPTCHA v3 returns score (0.0 - 1.0)
    // Score > 0.5 is likely human
    return isset($body['success']) && $body['success'] && $body['score'] > 0.5;
}
```

### 6.4 Abuse Handling

#### User Reporting System (Phase 2)

**GraphQL Mutation:**

```graphql
mutation ReportReview($input: ReportReviewInput!) {
  reportReview(input: $input) {
    success
    message
  }
}

input ReportReviewInput {
  reviewId: ID!
  reason: ReportReason!
  details: String
}

enum ReportReason {
  SPAM
  OFFENSIVE
  OFF_TOPIC
  FAKE
  COPYRIGHT
  OTHER
}
```

**Backend Implementation:**

```php
/**
 * Report review mutation
 */
register_graphql_mutation('reportReview', [
    'inputFields' => [
        'reviewId' => ['type' => ['non_null' => 'ID']],
        'reason' => ['type' => ['non_null' => 'ReportReason']],
        'details' => ['type' => 'String'],
    ],
    'outputFields' => [
        'success' => ['type' => ['non_null' => 'Boolean']],
        'message' => ['type' => ['non_null' => 'String']],
    ],
    'mutateAndGetPayload' => function($input, $context) {
        if (!is_user_logged_in()) {
            return [
                'success' => false,
                'message' => __('You must be logged in to report reviews.', 'mebl-review-bridge'),
            ];
        }

        $review_id = intval($input['reviewId']);
        $user_id = get_current_user_id();

        // Check if already reported by this user
        $existing = get_comment_meta($review_id, '_mebl_reported_by', false);
        if (in_array($user_id, $existing)) {
            return [
                'success' => false,
                'message' => __('You have already reported this review.', 'mebl-review-bridge'),
            ];
        }

        // Store report
        add_comment_meta($review_id, '_mebl_reported_by', $user_id);
        add_comment_meta($review_id, '_mebl_report_reason', $input['reason']);
        add_comment_meta($review_id, '_mebl_report_details', $input['details'] ?? '');

        // Increment report count
        $report_count = (int) get_comment_meta($review_id, '_mebl_report_count', true);
        update_comment_meta($review_id, '_mebl_report_count', $report_count + 1);

        // Auto-hide if 3+ reports (configurable)
        $threshold = apply_filters('mebl_auto_hide_threshold', 3);
        if ($report_count + 1 >= $threshold) {
            wp_set_comment_status($review_id, 'hold'); // Move to moderation

            // Notify admin
            $admin_email = get_option('admin_email');
            wp_mail(
                $admin_email,
                __('Review flagged for moderation', 'mebl-review-bridge'),
                sprintf(__('Review #%d has been flagged by multiple users.', 'mebl-review-bridge'), $review_id)
            );
        }

        return [
            'success' => true,
            'message' => __('Thank you for reporting. We will review this content.', 'mebl-review-bridge'),
        ];
    },
]);
```

**Frontend Component:**

```typescript
/**
 * Report button in ReviewCard
 */
import { Flag } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const [reportReview] = useMutation(REPORT_REVIEW);
const [selectedReason, setSelectedReason] = useState('');

const handleReport = async () => {
  try {
    const { data } = await reportReview({
      variables: {
        input: {
          reviewId: review.id,
          reason: selectedReason,
        },
      },
    });

    if (data?.reportReview?.success) {
      toast.success('Review reported successfully');
    }
  } catch (error) {
    toast.error('Failed to report review');
  }
};

// In ReviewCard component
<div className="mt-3 flex items-center gap-4 text-sm">
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button className="text-gray-500 hover:text-red-600 flex items-center gap-1">
        <Flag className="w-4 h-4" />
        Report
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Report Review</AlertDialogTitle>
        <AlertDialogDescription>
          Please select a reason for reporting this review.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <Select value={selectedReason} onValueChange={setSelectedReason}>
        <SelectTrigger>
          <SelectValue placeholder="Select reason" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SPAM">Spam</SelectItem>
          <SelectItem value="OFFENSIVE">Offensive content</SelectItem>
          <SelectItem value="OFF_TOPIC">Off-topic</SelectItem>
          <SelectItem value="FAKE">Fake review</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleReport}>
          Submit Report
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>
```

#### IP Blocking (Server-Level)

```php
/**
 * Block known spam IPs
 */
add_filter('mebl_review_before_insert', function($comment_data) {
    $ip = $_SERVER['REMOTE_ADDR'];

    // Check against blocklist
    $blocked_ips = get_option('mebl_blocked_ips', []);

    if (in_array($ip, $blocked_ips)) {
        wp_die(__('Your IP address has been blocked.', 'mebl-review-bridge'));
    }

    return $comment_data;
});

// Admin interface to manage blocklist
add_action('admin_menu', function() {
    add_submenu_page(
        'edit-comments.php',
        __('Blocked IPs', 'mebl-review-bridge'),
        __('Blocked IPs', 'mebl-review-bridge'),
        'moderate_comments',
        'mebl-blocked-ips',
        'mebl_render_blocked_ips_page'
    );
});
```

### 6.5 Content Moderation Policies

#### Automated Content Filtering

```php
/**
 * Blacklist filtering (profanity, spam keywords)
 */
class MEBL_Content_Filter {

    private static $blacklist = [
        'viagra', 'cialis', 'casino', 'forex', 'crypto',
        // Add profanity list
    ];

    public static function contains_blacklisted_words($content) {
        $content_lower = strtolower($content);

        foreach (self::$blacklist as $word) {
            if (strpos($content_lower, $word) !== false) {
                return true;
            }
        }

        return false;
    }

    public static function get_toxicity_score($content) {
        // Simple heuristics (Phase 2: integrate Perspective API)
        $score = 0;

        // All caps = +1
        if ($content === strtoupper($content)) {
            $score += 1;
        }

        // Excessive punctuation = +1
        if (substr_count($content, '!') > 3 || substr_count($content, '?') > 3) {
            $score += 1;
        }

        // Short generic reviews = +1
        if (strlen($content) < 20) {
            $score += 1;
        }

        return $score;
    }
}

// Apply in validation
if (MEBL_Content_Filter::contains_blacklisted_words($content)) {
    return [
        'success' => false,
        'message' => __('Your review contains prohibited content.', 'mebl-review-bridge'),
    ];
}

$toxicity = MEBL_Content_Filter::get_toxicity_score($content);
if ($toxicity > 2) {
    // Auto-flag for moderation
    $comment_data['comment_approved'] = 'hold';
}
```

#### Machine Learning Content Analysis (Phase 2)

```php
/**
 * Integrate Google Perspective API for toxicity detection
 */
function mebl_analyze_review_toxicity($content) {
    $api_key = get_option('mebl_perspective_api_key');

    if (empty($api_key)) {
        return 0; // Skip if not configured
    }

    $response = wp_remote_post('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=' . $api_key, [
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode([
            'comment' => ['text' => $content],
            'requestedAttributes' => [
                'TOXICITY' => [],
                'SEVERE_TOXICITY' => [],
                'SPAM' => [],
            ],
        ]),
    ]);

    if (is_wp_error($response)) {
        return 0;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $toxicity = $body['attributeScores']['TOXICITY']['summaryScore']['value'] ?? 0;

    return $toxicity; // 0.0 - 1.0
}

// In mutation resolver
$toxicity_score = mebl_analyze_review_toxicity($content);
if ($toxicity_score > 0.7) {
    return [
        'success' => false,
        'message' => __('Your review violates our community guidelines.', 'mebl-review-bridge'),
    ];
}
```

### 6.6 Admin Monitoring Dashboard (Phase 2)

**Custom Admin Page:**

```php
/**
 * Review analytics dashboard
 */
add_action('admin_menu', function() {
    add_menu_page(
        __('Review Analytics', 'mebl-review-bridge'),
        __('Reviews', 'mebl-review-bridge'),
        'moderate_comments',
        'mebl-review-analytics',
        'mebl_render_analytics_page',
        'dashicons-star-filled',
        25
    );
});

function mebl_render_analytics_page() {
    global $wpdb;

    // Fetch statistics
    $total_reviews = $wpdb->get_var("
        SELECT COUNT(*) FROM {$wpdb->comments}
        WHERE comment_type = 'review'
    ");

    $pending_reviews = $wpdb->get_var("
        SELECT COUNT(*) FROM {$wpdb->comments}
        WHERE comment_type = 'review' AND comment_approved = '0'
    ");

    $spam_reviews = $wpdb->get_var("
        SELECT COUNT(*) FROM {$wpdb->comments}
        WHERE comment_type = 'review' AND comment_approved = 'spam'
    ");

    $avg_rating = $wpdb->get_var("
        SELECT AVG(CAST(cm.meta_value AS DECIMAL(3,2)))
        FROM {$wpdb->commentmeta} cm
        INNER JOIN {$wpdb->comments} c ON cm.comment_id = c.comment_ID
        WHERE c.comment_type = 'review'
          AND c.comment_approved = '1'
          AND cm.meta_key = 'rating'
    ");

    ?>
    <div class="wrap">
        <h1><?php _e('Review Analytics', 'mebl-review-bridge'); ?></h1>

        <div class="mebl-stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px;">
            <div class="mebl-stat-card" style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h3><?php _e('Total Reviews', 'mebl-review-bridge'); ?></h3>
                <p style="font-size: 32px; font-weight: bold; margin: 10px 0;"><?php echo number_format($total_reviews); ?></p>
            </div>

            <div class="mebl-stat-card" style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h3><?php _e('Pending Moderation', 'mebl-review-bridge'); ?></h3>
                <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #f59e0b;"><?php echo number_format($pending_reviews); ?></p>
            </div>

            <div class="mebl-stat-card" style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h3><?php _e('Marked as Spam', 'mebl-review-bridge'); ?></h3>
                <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #ef4444;"><?php echo number_format($spam_reviews); ?></p>
            </div>

            <div class="mebl-stat-card" style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h3><?php _e('Average Rating', 'mebl-review-bridge'); ?></h3>
                <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #10b981;"><?php echo number_format($avg_rating, 2); ?> / 5</p>
            </div>
        </div>

        <div style="margin-top: 40px;">
            <h2><?php _e('Recent Activity', 'mebl-review-bridge'); ?></h2>
            <?php
            // Show recent reviews table
            $recent = $wpdb->get_results("
                SELECT c.*, p.post_title, cm.meta_value as rating
                FROM {$wpdb->comments} c
                INNER JOIN {$wpdb->posts} p ON c.comment_post_ID = p.ID
                LEFT JOIN {$wpdb->commentmeta} cm ON c.comment_ID = cm.comment_id AND cm.meta_key = 'rating'
                WHERE c.comment_type = 'review'
                ORDER BY c.comment_date DESC
                LIMIT 10
            ");

            echo '<table class="wp-list-table widefat fixed striped">';
            echo '<thead><tr><th>Product</th><th>Author</th><th>Rating</th><th>Status</th><th>Date</th></tr></thead><tbody>';
            foreach ($recent as $review) {
                $status_labels = [
                    '0' => 'Pending',
                    '1' => 'Approved',
                    'spam' => 'Spam',
                ];
                echo '<tr>';
                echo '<td>' . esc_html($review->post_title) . '</td>';
                echo '<td>' . esc_html($review->comment_author) . '</td>';
                echo '<td>' . str_repeat('★', (int)$review->rating) . '</td>';
                echo '<td>' . $status_labels[$review->comment_approved] . '</td>';
                echo '<td>' . date('Y-m-d H:i', strtotime($review->comment_date)) . '</td>';
                echo '</tr>';
            }
            echo '</tbody></table>';
            ?>
        </div>
    </div>
    <?php
}
```

---

**End of Part 6**

✅ Moderation workflows defined (manual, auto-approval, priority queuing)  
✅ Security measures implemented (input sanitization, SQL injection prevention, XSS protection)  
✅ Spam prevention strategies detailed (rate limiting, Akismet, honeypots, CAPTCHA)  
✅ Abuse handling system designed (user reporting, IP blocking, content filtering)  
✅ Content moderation policies established (blacklist filtering, toxicity scoring)  
✅ Admin monitoring dashboard specified

---

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
        // Step 1: Spam check (Akismet)
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
    'reason' => 'akismet_flagged',
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

## Document Complete ✅

This implementation plan now covers all aspects of the product review system from architecture through deployment and long-term maintenance. Use this as:

1. **Development Blueprint**: Follow sections 1-5 for initial implementation
2. **Operations Guide**: Reference sections 6-7 for production operations
3. **Rollout Playbook**: Execute section 8.1 for phased deployment
4. **Future Reference**: Consult section 8.5-8.8 for enhancements and maintenance

**Total Coverage**:

- ✅ Architecture & Data Model
- ✅ API Contracts & Backend Implementation
- ✅ Frontend Integration & SEO
- ✅ Security & Moderation
- ✅ Performance & Scalability
- ✅ Rollout & Migration
- ✅ Future Extensibility & Maintenance

**Next Steps**:

1. Review entire document for any gaps or clarifications needed
2. Create GitHub issues/tickets for each major section
3. Begin Phase 0 preparation (Week 1 of rollout plan)
4. Schedule team kickoff to assign ownership

---

**Document Metadata**:

- **Created**: December 13, 2025
- **Version**: 1.0
- **Total Sections**: 8 parts across 59 subsections
- **Target Audience**: Development team, DevOps, product managers
- **Status**: Ready for implementation
