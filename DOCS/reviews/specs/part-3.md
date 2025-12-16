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
