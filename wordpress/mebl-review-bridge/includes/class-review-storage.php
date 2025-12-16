<?php
/**
 * Review Storage Class
 * 
 * Handles CRUD operations for product reviews stored in wp_comments table.
 * Enforces comment_type='review' and manages review metadata (rating, verified).
 * 
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Review_Storage {
    
    /**
     * Insert a new review into wp_comments table
     * 
     * @param array $args {
     *     Review data.
     *     @type int    $product_id     Product ID (required)
     *     @type int    $user_id        User ID (required, must be > 0)
     *     @type string $author_name    Reviewer display name
     *     @type string $author_email   Reviewer email
     *     @type string $content        Review text content
     *     @type int    $rating         Rating 1-5 (required)
     *     @type string $author_ip      IP address (optional)
     *     @type string $user_agent     User agent string (optional)
     * }
     * @return int|WP_Error Comment ID on success, WP_Error on failure
     */
    public static function insert_review($args) {
        global $wpdb;
        
        // Validate required fields
        if (empty($args['product_id']) || empty($args['user_id']) || empty($args['rating'])) {
            return new WP_Error(
                'missing_required_fields',
                __('Product ID, user ID, and rating are required.', 'mebl-review-bridge')
            );
        }
        
        // Enforce authenticated users only (no anonymous reviews)
        if ((int) $args['user_id'] <= 0) {
            return new WP_Error(
                'invalid_user_id',
                __('Reviews must be submitted by authenticated users.', 'mebl-review-bridge')
            );
        }
        
        // Validate rating range
        $rating = (int) $args['rating'];
        if ($rating < 1 || $rating > 5) {
            return new WP_Error(
                'invalid_rating',
                __('Rating must be between 1 and 5.', 'mebl-review-bridge')
            );
        }
        
        // Verify product exists
        $product = get_post($args['product_id']);
        if (!$product || $product->post_type !== 'product') {
            error_log(sprintf(
                'MEBL Review Bridge: Review submission failed - Invalid product ID: %d',
                $args['product_id']
            ));
            return new WP_Error(
                'invalid_product',
                __('Product does not exist.', 'mebl-review-bridge')
            );
        }
        
        // Check for duplicate review (approved OR pending only)
        // Skip check if user is admin
        if (!current_user_can('manage_woocommerce')) {
            $existing = get_comments([
                'post_id' => $args['product_id'],
                'user_id' => $args['user_id'],
                'type'    => 'review',
                'status'  => ['approve', 'hold'], // 'approve' = approved, 'hold' = pending
                'count'   => true,
            ]);
            
            if ($existing > 0) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log(sprintf(
                        'MEBL Review Bridge: Duplicate review blocked - User %d already reviewed product %d',
                        $args['user_id'],
                        $args['product_id']
                    ));
                }
                
                return new WP_Error(
                    'duplicate_review',
                    __('You have already reviewed this product.', 'mebl-review-bridge')
                );
            }
        }
        
        // Rate limiting (max 5 reviews per hour)
        // Skip check if user is admin
        if (!current_user_can('manage_woocommerce')) {
            $transient_key = 'mebl_rate_limit_user_' . $args['user_id'];
            $review_count = get_transient($transient_key);
            
            if ($review_count !== false && (int) $review_count >= 5) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log(sprintf(
                        'MEBL Review Bridge: Rate limit exceeded - User %d has submitted %d reviews in the last hour',
                        $args['user_id'],
                        $review_count
                    ));
                }
                
                return new WP_Error(
                    'rate_limit_exceeded',
                    __('You are submitting reviews too quickly. Please try again later.', 'mebl-review-bridge')
                );
            }
        }
        
        // Prepare comment data
        $comment_data = array(
            'comment_post_ID'      => (int) $args['product_id'],
            'comment_author'       => !empty($args['author_name']) ? sanitize_text_field($args['author_name']) : '',
            'comment_author_email' => !empty($args['author_email']) ? sanitize_email($args['author_email']) : '',
            'comment_author_IP'    => !empty($args['author_ip']) ? sanitize_text_field($args['author_ip']) : '',
            'comment_agent'        => !empty($args['user_agent']) ? sanitize_text_field($args['user_agent']) : '',
            'comment_content'      => !empty($args['content']) ? wp_kses_post($args['content']) : '',
            'comment_type'         => 'review', // Critical: distinguish from regular comments
            'comment_approved'     => '0', // Pending moderation by default
            'user_id'              => (int) $args['user_id'],
            'comment_date'         => current_time('mysql'),
            'comment_date_gmt'     => current_time('mysql', 1),
        );
        
        // Insert comment
        $comment_id = wp_insert_comment($comment_data);
        
        if (!$comment_id) {
            error_log(sprintf(
                'MEBL Review Bridge: wp_insert_comment() failed for product %d, user %d. Comment data: %s',
                $args['product_id'],
                $args['user_id'],
                wp_json_encode($comment_data)
            ));
            return new WP_Error(
                'insert_failed',
                __('Failed to insert review.', 'mebl-review-bridge')
            );
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                'MEBL Review Bridge: Review created successfully. Comment ID: %d, Product ID: %d, User ID: %d, Rating: %d',
                $comment_id,
                $args['product_id'],
                $args['user_id'],
                $rating
            ));
        }
        
        // Add review metadata (atomic operation - rollback on failure)
        $metadata_result = self::add_review_metadata($comment_id, $rating, $args);
        
        if (is_wp_error($metadata_result)) {
            // Critical: Metadata failed - rollback comment to maintain data integrity
            wp_delete_comment($comment_id, true); // Force delete (bypass trash)
            
            // Note: Rate limit counter is NOT decremented on rollback.
            // This is intentional - transient will expire naturally after 1 hour.
            // Failed insertions due to system errors should not permanently block users.
            
            error_log(sprintf(
                'MEBL Review Bridge: Failed to add metadata for comment %d. Comment deleted. Error: %s',
                $comment_id,
                $metadata_result->get_error_message()
            ));
            
            return new WP_Error(
                'metadata_failed',
                __('Failed to create review: metadata insertion failed.', 'mebl-review-bridge'),
                array('comment_id' => $comment_id)
            );
        }
        
        // Increment rate limit counter AFTER successful metadata addition
        // This prevents counter pollution if metadata fails and comment is rolled back
        // Skip for admins (they bypass rate limiting)
        if (!current_user_can('manage_woocommerce')) {
            $transient_key = 'mebl_rate_limit_user_' . $args['user_id'];
            $review_count = get_transient($transient_key);
            
            if ($review_count === false) {
                set_transient($transient_key, 1, HOUR_IN_SECONDS);
            } else {
                set_transient($transient_key, (int) $review_count + 1, HOUR_IN_SECONDS);
            }
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    'MEBL Review Bridge: Rate limit counter incremented for user %d. Count: %d',
                    $args['user_id'],
                    $review_count === false ? 1 : (int) $review_count + 1
                ));
            }
        }
        
        return $comment_id;
    }
    
    /**
     * Add metadata to review comment
     * 
     * @param int   $comment_id Comment ID
     * @param int   $rating     Rating value (1-5)
     * @param array $args       Additional args (product_id, user_id, author_email for verified check)
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public static function add_review_metadata($comment_id, $rating, $args = array()) {
        // Store rating
        $rating_added = add_comment_meta($comment_id, 'rating', (int) $rating, true);
        
        if (!$rating_added) {
            return new WP_Error(
                'metadata_failed',
                __('Failed to add rating metadata.', 'mebl-review-bridge')
            );
        }
        
        // Store moderation state (per execution index Task 3)
        $comment = get_comment($comment_id);
        if ($comment) {
            add_comment_meta($comment_id, 'moderation_state', $comment->comment_approved, true);
        }
        
        // Calculate and store verified purchase status
        $verified = '0'; // Default: not verified
        
        if (!empty($args['product_id']) && !empty($args['user_id'])) {
            $is_verified = self::check_verified_purchase(
                (int) $args['user_id'],
                !empty($args['author_email']) ? $args['author_email'] : '',
                (int) $args['product_id']
            );
            
            $verified = $is_verified ? '1' : '0';
        }
        
        add_comment_meta($comment_id, 'verified', $verified, true);
        
        return true;
    }
    
    /**
     * Check if user has purchased the product (verified purchase)
     * 
     * @param int    $user_id     User ID
     * @param string $user_email  User email address
     * @param int    $product_id  Product ID
     * @return bool True if verified purchase, false otherwise
     */
    public static function check_verified_purchase($user_id, $user_email, $product_id) {
        // Ensure WooCommerce is loaded
        if (!function_exists('wc_customer_bought_product')) {
            error_log('MEBL Review Bridge: wc_customer_bought_product() function not available. WooCommerce may not be loaded.');
            return false;
        }
        
        // Use WooCommerce built-in function
        // Checks if customer has completed/processing orders containing this product
        $verified = wc_customer_bought_product($user_email, $user_id, $product_id);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                'MEBL Review Bridge: Verified purchase check - User ID: %d, Email: %s, Product ID: %d, Result: %s',
                $user_id,
                $user_email,
                $product_id,
                $verified ? 'VERIFIED' : 'NOT VERIFIED'
            ));
        }
        
        return (bool) $verified;
    }
    
    /**
     * Get reviews for a specific product
     * 
     * @param int   $product_id Product ID
     * @param array $args {
     *     Optional query args.
     *     @type string $status   Comment status ('approve', 'hold', 'all'). Default 'approve'.
     *     @type int    $number   Number of reviews to retrieve. Default 10.
     *     @type int    $offset   Offset for pagination. Default 0.
     *     @type string $orderby  Order by field. Default 'comment_date'.
     *     @type string $order    Sort order (ASC, DESC). Default 'DESC'.
     * }
     * @return array Array of comment objects
     */
    public static function get_reviews_by_product($product_id, $args = array()) {
        $defaults = array(
            'post_id' => (int) $product_id,
            'type'    => 'review',
            'status'  => 'approve',
            'number'  => 10,
            'offset'  => 0,
            'orderby' => 'comment_date',
            'order'   => 'DESC',
        );
        
        $query_args = wp_parse_args($args, $defaults);
        
        // Get comments
        $comments = get_comments($query_args);
        
        if (is_wp_error($comments)) {
            error_log(sprintf(
                'MEBL Review Bridge: get_comments() error for product %d: %s',
                $product_id,
                $comments->get_error_message()
            ));
            return [];
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                'MEBL Review Bridge: Retrieved %d reviews for product %d',
                count($comments),
                $product_id
            ));
        }
        
        return $comments;
    }
    
    /**
     * Get reviews by a specific user
     * 
     * NOTE: This method returns ALL review statuses by default (approved, pending, spam, trash).
     * Callers MUST implement proper authentication and authorization checks to ensure:
     * - Authenticated user can only see their own pending/spam/trash reviews
     * - Unauthenticated users should only see approved reviews
     * This will be properly enforced in Phase 3 (GraphQL Read API) with resolver-level checks.
     * 
     * @param int   $user_id User ID
     * @param array $args    Optional query args (same as get_reviews_by_product)
     * @return array Array of comment objects
     */
    public static function get_reviews_by_user($user_id, $args = array()) {
        $defaults = array(
            'user_id' => (int) $user_id,
            'type'    => 'review',
            'status'  => 'all', // Include pending reviews for user's own reviews
            'number'  => 10,
            'offset'  => 0,
            'orderby' => 'comment_date',
            'order'   => 'DESC',
        );
        
        $query_args = wp_parse_args($args, $defaults);
        
        // Get comments
        $comments = get_comments($query_args);
        
        return $comments;
    }
    
    /**
     * Get review metadata (rating, verified)
     * 
     * @param int $comment_id Comment ID
     * @return array|false Array with 'rating' and 'verified' keys, false on failure
     */
    public static function get_review_metadata($comment_id) {
        $rating = get_comment_meta($comment_id, 'rating', true);
        $verified = get_comment_meta($comment_id, 'verified', true);
        
        if (empty($rating)) {
            return false;
        }
        
        return array(
            'rating'   => (int) $rating,
            'verified' => $verified === '1',
        );
    }
}
