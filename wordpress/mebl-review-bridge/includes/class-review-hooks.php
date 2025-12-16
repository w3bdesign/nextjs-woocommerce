<?php
/**
 * Review Hooks Class
 * 
 * Registers WordPress action hooks to manage review lifecycle.
 * Handles review creation, status changes, and deletions.
 * Automatically updates product rating aggregates when reviews change.
 * 
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Review_Hooks {
    
    /**
     * Initialize hooks
     * 
     * Called during plugins_loaded action.
     */
    public static function init() {
        // Hook into comment creation
        add_action('comment_post', array(__CLASS__, 'on_comment_post'), 10, 3);
        
        // Hook into comment status transitions (approval, spam, trash, etc.)
        add_action('transition_comment_status', array(__CLASS__, 'on_status_change'), 10, 3);
        
        // Hook into comment deletion
        add_action('deleted_comment', array(__CLASS__, 'on_comment_delete'), 10, 2);
        
        // Hook into comment update (for rating changes)
        add_action('edit_comment', array(__CLASS__, 'on_comment_edit'), 10, 2);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('MEBL Review Bridge: WordPress hooks initialized successfully.');
        }
    }
    
    /**
     * Handle new comment creation
     * 
     * Ensures comments for products are tagged as 'review' type
     * and have proper metadata.
     * 
     * @param int        $comment_id       Comment ID
     * @param int|string $comment_approved Comment approval status (1, 0, 'spam', etc.)
     * @param array      $commentdata      Comment data array
     */
    public static function on_comment_post($comment_id, $comment_approved, $commentdata) {
        // Get the comment
        $comment = get_comment($comment_id);
        
        if (!$comment) {
            return;
        }
        
        // Check if this is a comment on a product
        $post = get_post($comment->comment_post_ID);
        
        if (!$post || $post->post_type !== 'product') {
            return; // Not a product comment
        }
        
        // If comment_type is not already 'review', set it
        if ($comment->comment_type !== 'review') {
            $updated = wp_update_comment(array(
                'comment_ID'   => $comment_id,
                'comment_type' => 'review',
            ));
            
            if ($updated) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log(sprintf(
                        'MEBL Review Bridge: Comment %d on product %d converted to review type.',
                        $comment_id,
                        $post->ID
                    ));
                }
            } else {
                error_log(sprintf(
                    'MEBL Review Bridge: Failed to convert comment %d to review type.',
                    $comment_id
                ));
            }
        }
        
        // Note: Metadata (rating, verified) should be added by MEBL_Review_Storage::insert_review()
        // This hook serves as a fallback for comments created through other means
    }
    
    /**
     * Handle comment status transitions
     * 
     * Recalculates product rating aggregates when review approval status changes.
     * 
     * @param string     $new_status New comment status
     * @param string     $old_status Old comment status
     * @param WP_Comment $comment    Comment object
     */
    public static function on_status_change($new_status, $old_status, $comment) {
        // Only process reviews
        if ($comment->comment_type !== 'review') {
            return;
        }
        
        // Only process if status actually changed
        if ($new_status === $old_status) {
            return;
        }
        
        // Check if this is a product review
        $post = get_post($comment->comment_post_ID);
        
        if (!$post || $post->post_type !== 'product') {
            return;
        }
        
        // Recalculate product rating when:
        // - Review is approved (pending -> approved, spam -> approved)
        // - Review is unapproved (approved -> pending, approved -> spam)
        // - Review is deleted/trashed (approved -> trash)
        
        $triggers_recalc = array(
            'approved',  // Approved status
            'unapproved', // Pending status
            'spam',
            'trash',
        );
        
        if (in_array($new_status, $triggers_recalc) || in_array($old_status, $triggers_recalc)) {
            // Recalculate rating aggregates
            $result = MEBL_Rating_Aggregator::calculate_product_rating($comment->comment_post_ID);
            
            if ($result === false) {
                error_log(sprintf(
                    'MEBL Review Bridge: Failed to recalculate rating for product %d after review %d status change (%s -> %s)',
                    $comment->comment_post_ID,
                    $comment->comment_ID,
                    $old_status,
                    $new_status
                ));
            }
        }
    }
    
    /**
     * Handle comment deletion
     * 
     * Recalculates product rating aggregates when a review is permanently deleted.
     * 
     * @param int        $comment_id Comment ID
     * @param WP_Comment $comment    Comment object
     */
    public static function on_comment_delete($comment_id, $comment) {
        // Only process reviews
        if ($comment->comment_type !== 'review') {
            return;
        }
        
        // Check if this is a product review
        $post = get_post($comment->comment_post_ID);
        
        if (!$post || $post->post_type !== 'product') {
            return;
        }
        
        // Recalculate rating aggregates
        $result = MEBL_Rating_Aggregator::calculate_product_rating($comment->comment_post_ID);
        
        if ($result === false) {
            error_log(sprintf(
                'MEBL Review Bridge: Failed to recalculate rating for product %d after review %d deletion',
                $comment->comment_post_ID,
                $comment_id
            ));
        }
    }
    
    /**
     * Handle comment edit
     * 
     * Recalculates product rating if the rating metadata changes.
     * 
     * @param int   $comment_id Comment ID
     * @param array $data       Comment data
     */
    public static function on_comment_edit($comment_id, $data) {
        // Get the comment
        $comment = get_comment($comment_id);
        
        if (!$comment || $comment->comment_type !== 'review') {
            return;
        }
        
        // Check if this is an approved product review
        $post = get_post($comment->comment_post_ID);
        
        if (!$post || $post->post_type !== 'product') {
            return;
        }
        
        // Only recalculate if the review is approved
        // (editing pending reviews doesn't affect aggregate ratings)
        if ($comment->comment_approved === '1') {
            // Recalculate rating aggregates
            MEBL_Rating_Aggregator::calculate_product_rating($comment->comment_post_ID);
        }
    }
}
