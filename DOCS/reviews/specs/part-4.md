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
