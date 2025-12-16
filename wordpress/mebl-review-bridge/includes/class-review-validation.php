<?php
/**
 * Review Validation Class
 * 
 * Validates review submissions for rating range, content length, duplicates, and rate limiting.
 * Implements anti-abuse measures per Phase 2 specification.
 * 
 * NOTE: This class is prepared for Phase 4 (GraphQL Write API) and is not actively used in Phase 2.
 * Phase 2 validation is currently handled directly in MEBL_Review_Storage::insert_review().
 * When GraphQL mutations are implemented (Phase 4), this class will be the primary validation layer.
 * 
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Review_Validation {
    
    /**
     * Validate review submission
     * 
     * Performs comprehensive validation including:
     * - Authentication check
     * - Product existence
     * - Rating range (1-5)
     * - Content length (10-5000 characters)
     * - Duplicate review check (approved OR pending only)
     * - Rate limiting (max 5 reviews per hour)
     * - Admin bypass for duplicate and rate limit checks
     * 
     * @param array  $input   Mutation input containing productId, rating, content
     * @param object $context GraphQL context with current user
     * @return array {
     *     Validation result.
     *     @type bool   $valid   Whether validation passed
     *     @type string $message Error message if validation failed
     * }
     */
    public static function validate_submission($input, $context = null) {
        // Check authentication
        $user = wp_get_current_user();
        
        if (!$user || !$user->ID || $user->ID === 0) {
            return [
                'valid' => false,
                'message' => __('You must be logged in to submit a review.', 'mebl-review-bridge'),
            ];
        }
        
        // Extract and validate product ID
        $product_id = isset($input['productId']) ? (int) $input['productId'] : 0;
        
        if ($product_id <= 0) {
            return [
                'valid' => false,
                'message' => __('Invalid product ID.', 'mebl-review-bridge'),
            ];
        }
        
        // Verify product exists and is a WooCommerce product
        $product = get_post($product_id);
        
        if (!$product || $product->post_type !== 'product') {
            return [
                'valid' => false,
                'message' => __('Product not found.', 'mebl-review-bridge'),
            ];
        }
        
        // Validate rating range (1-5)
        $rating = isset($input['rating']) ? (int) $input['rating'] : 0;
        
        if ($rating < 1 || $rating > 5) {
            return [
                'valid' => false,
                'message' => __('Rating must be between 1 and 5 stars.', 'mebl-review-bridge'),
            ];
        }
        
        // Validate content length
        $content = isset($input['content']) ? trim($input['content']) : '';
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
        
        // Check if user is admin (bypass duplicate and rate limit checks)
        $is_admin = current_user_can('manage_woocommerce');
        
        // Check duplicate review (approved OR pending only)
        if (!$is_admin) {
            $duplicate_check = self::check_duplicate_review($product_id, $user->ID);
            
            if (!$duplicate_check['valid']) {
                return $duplicate_check;
            }
        }
        
        // Rate limiting (max 5 reviews per hour)
        if (!$is_admin) {
            $rate_limit_check = self::check_rate_limit($user->ID);
            
            if (!$rate_limit_check['valid']) {
                return $rate_limit_check;
            }
        }
        
        return [
            'valid' => true,
            'message' => '',
        ];
    }
    
    /**
     * Check for duplicate review
     * 
     * Checks if user has already submitted an approved or pending review for this product.
     * Allows resubmission if previous review was trashed or marked as spam.
     * 
     * @param int $product_id Product ID
     * @param int $user_id    User ID
     * @return array Validation result
     */
    public static function check_duplicate_review($product_id, $user_id) {
        // Query for existing reviews (approved OR pending only)
        $existing = get_comments([
            'post_id' => $product_id,
            'user_id' => $user_id,
            'type'    => 'review',
            'status'  => ['approve', 'hold'], // 'approve' = approved, 'hold' = pending
            'count'   => true,
        ]);
        
        if ($existing > 0) {
            return [
                'valid' => false,
                'message' => __('You have already reviewed this product.', 'mebl-review-bridge'),
            ];
        }
        
        return [
            'valid' => true,
            'message' => '',
        ];
    }
    
    /**
     * Check rate limiting
     * 
     * Enforces maximum 5 reviews per hour per user using transients.
     * Transients auto-expire after 1 hour, no manual cleanup needed.
     * 
     * @param int $user_id User ID
     * @return array Validation result
     */
    public static function check_rate_limit($user_id) {
        $transient_key = 'mebl_rate_limit_user_' . $user_id;
        $review_count = get_transient($transient_key);
        
        // If transient doesn't exist, this is first review in current hour
        if ($review_count === false) {
            return [
                'valid' => true,
                'message' => '',
            ];
        }
        
        // Check if limit exceeded
        if ((int) $review_count >= 5) {
            return [
                'valid' => false,
                'message' => __('You are submitting reviews too quickly. Please try again later.', 'mebl-review-bridge'),
            ];
        }
        
        return [
            'valid' => true,
            'message' => '',
        ];
    }
    
    /**
     * Increment rate limit counter
     * 
     * Called after successful review insertion to track submission count.
     * Creates or increments transient with 1-hour expiration.
     * 
     * @param int $user_id User ID
     * @return void
     */
    public static function increment_rate_limit($user_id) {
        $transient_key = 'mebl_rate_limit_user_' . $user_id;
        $review_count = get_transient($transient_key);
        
        if ($review_count === false) {
            // First review in current hour
            set_transient($transient_key, 1, HOUR_IN_SECONDS);
        } else {
            // Increment counter
            set_transient($transient_key, (int) $review_count + 1, HOUR_IN_SECONDS);
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                'MEBL Review Bridge: Rate limit counter incremented for user %d. Count: %d',
                $user_id,
                $review_count === false ? 1 : (int) $review_count + 1
            ));
        }
    }
}
