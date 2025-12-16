<?php
/**
 * Rating Aggregator Class
 * 
 * Calculates and caches product rating aggregates (average, count, histogram).
 * Stores cached values in wp_postmeta for fast retrieval.
 * 
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Rating_Aggregator {
    
    /**
     * Calculate product rating statistics and update cache
     * 
     * Queries all approved reviews for a product, calculates average rating,
     * total count, and rating distribution histogram.
     * 
     * @param int $product_id Product ID
     * @return array|false {
     *     Rating statistics, false on failure.
     *     @type float $average   Average rating (0.00 - 5.00)
     *     @type int   $count     Total number of approved reviews
     *     @type array $histogram Rating distribution (1-5 stars)
     * }
     */
    public static function calculate_product_rating($product_id) {
        global $wpdb;
        
        if (empty($product_id)) {
            return false;
        }
        
        // Query all approved reviews with ratings
        $query = $wpdb->prepare("
            SELECT cm.meta_value as rating
            FROM {$wpdb->comments} c
            INNER JOIN {$wpdb->commentmeta} cm ON c.comment_ID = cm.comment_id
            WHERE c.comment_post_ID = %d
              AND c.comment_approved = '1'
              AND c.comment_type = 'review'
              AND cm.meta_key = 'rating'
        ", $product_id);
        
        $ratings = $wpdb->get_col($query);
        
        if ($wpdb->last_error) {
            error_log(sprintf(
                'MEBL Review Bridge: Database error in calculate_product_rating for product %d. Error: %s',
                $product_id,
                $wpdb->last_error
            ));
            return false;
        }
        
        // Convert to integers
        $ratings = array_map('intval', $ratings);
        
        // Calculate statistics
        $count = count($ratings);
        $average = $count > 0 ? array_sum($ratings) / $count : 0;
        
        // Build histogram
        $histogram = self::calculate_rating_histogram($ratings);
        
        // Update product meta (cache)
        self::update_product_meta($product_id, $average, $count, $histogram);
        
        return array(
            'average'   => round($average, 2),
            'count'     => $count,
            'histogram' => $histogram,
        );
    }
    
    /**
     * Calculate rating distribution histogram
     * 
     * @param array $ratings Array of rating values (1-5)
     * @return array Associative array with star counts {1: X, 2: X, 3: X, 4: X, 5: X}
     */
    public static function calculate_rating_histogram($ratings) {
        // Initialize histogram with zeros
        $histogram = array(
            '5' => 0,
            '4' => 0,
            '3' => 0,
            '2' => 0,
            '1' => 0,
        );
        
        // Count occurrences of each rating
        foreach ($ratings as $rating) {
            $rating = (int) $rating;
            if ($rating >= 1 && $rating <= 5) {
                $histogram[(string) $rating]++;
            }
        }
        
        return $histogram;
    }
    
    /**
     * Update product meta with rating aggregates
     * 
     * Stores cached values in wp_postmeta for fast retrieval without querying comments.
     * 
     * @param int   $product_id Product ID
     * @param float $average    Average rating
     * @param int   $count      Review count
     * @param array $histogram  Rating distribution
     * @return bool True on success, false on failure
     */
    public static function update_product_meta($product_id, $average, $count, $histogram) {
        if (empty($product_id)) {
            error_log('MEBL Review Bridge: update_product_meta() called with empty product_id.');
            return false;
        }
        
        // Update average rating (rounded to 2 decimals)
        $average_updated = update_post_meta(
            $product_id,
            '_wc_average_rating',
            round((float) $average, 2)
        );
        
        // Update review count
        $count_updated = update_post_meta(
            $product_id,
            '_wc_review_count',
            (int) $count
        );
        
        // Update rating histogram (stored as JSON)
        $histogram_updated = update_post_meta(
            $product_id,
            '_wc_rating_histogram',
            wp_json_encode($histogram)
        );
        
        $success = ($average_updated !== false) && ($count_updated !== false) && ($histogram_updated !== false);
        
        if (!$success) {
            error_log(sprintf(
                'MEBL Review Bridge: Failed to update product meta for product %d. Average: %s, Count: %s, Histogram: %s',
                $product_id,
                $average_updated !== false ? 'OK' : 'FAILED',
                $count_updated !== false ? 'OK' : 'FAILED',
                $histogram_updated !== false ? 'OK' : 'FAILED'
            ));
        } else if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                'MEBL Review Bridge: Product meta updated successfully. Product ID: %d, Average: %.2f, Count: %d, Histogram: %s',
                $product_id,
                $average,
                $count,
                wp_json_encode($histogram)
            ));
        }
        
        // Also update WordPress core comment_count (for consistency)
        wp_update_comment_count($product_id);
        
        // Invalidate transients
        self::invalidate_cache($product_id);
        
        return $success;
    }
    
    /**
     * Invalidate cached data for a product
     * 
     * Deletes transients that may cache review data.
     * 
     * @param int $product_id Product ID
     * @return void
     */
    public static function invalidate_cache($product_id) {
        if (empty($product_id)) {
            error_log('MEBL Review Bridge: invalidate_cache() called with empty product_id.');
            return;
        }
        
        // Delete WooCommerce-specific transients (if they exist)
        delete_transient('wc_average_rating_' . $product_id);
        delete_transient('wc_review_count_' . $product_id);
        
        // Delete any custom transients (for future use)
        delete_transient('mebl_recent_reviews_' . $product_id);
        
        // Clear object cache
        wp_cache_delete($product_id, 'post_meta');
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                'MEBL Review Bridge: Cache invalidated for product %d',
                $product_id
            ));
        }
    }
    
    /**
     * Get cached rating data for a product
     * 
     * Retrieves cached values from wp_postmeta without querying comments.
     * 
     * @param int $product_id Product ID
     * @return array|false {
     *     Cached rating data, false if not cached.
     *     @type float $average   Average rating
     *     @type int   $count     Review count
     *     @type array $histogram Rating distribution
     * }
     */
    public static function get_cached_rating($product_id) {
        if (empty($product_id)) {
            return false;
        }
        
        $average = get_post_meta($product_id, '_wc_average_rating', true);
        $count = get_post_meta($product_id, '_wc_review_count', true);
        $histogram = get_post_meta($product_id, '_wc_rating_histogram', true);
        
        // If no cached data, return false
        if ($average === '' && $count === '') {
            return false;
        }
        
        // Decode histogram JSON
        $histogram_decoded = !empty($histogram) ? json_decode($histogram, true) : array();
        
        return array(
            'average'   => (float) $average,
            'count'     => (int) $count,
            'histogram' => $histogram_decoded,
        );
    }
    
    /**
     * Recalculate ratings for all products (bulk operation)
     * 
     * Useful for migrations or data fixes. Use with caution on large datasets.
     * 
     * @param int $limit Number of products to process per batch. Default 50.
     * @param int $offset Starting offset. Default 0.
     * @return int Number of products processed
     */
    public static function recalculate_all_ratings($limit = 50, $offset = 0) {
        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $limit,
            'offset'         => $offset,
            'fields'         => 'ids',
        );
        
        $product_ids = get_posts($args);
        
        $processed = 0;
        foreach ($product_ids as $product_id) {
            $result = self::calculate_product_rating($product_id);
            if ($result !== false) {
                $processed++;
            }
        }
        
        return $processed;
    }
}
