<?php
/**
 * WordPress Admin UI Customization for Review Moderation
 * 
 * Provides custom columns, filters, bulk actions, and meta boxes
 * for managing product reviews in WordPress admin.
 * 
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Review_Admin_UI {

    /**
     * Initialize admin UI hooks
     */
    public static function init() {
        // Add custom columns to comments list
        add_filter('manage_edit-comments_columns', [__CLASS__, 'add_custom_columns']);
        add_action('manage_comments_custom_column', [__CLASS__, 'render_custom_columns'], 10, 2);

        // Add filter dropdown for review type
        add_action('restrict_manage_comments', [__CLASS__, 'add_filter_dropdown']);

        // Add rating meta box
        add_action('add_meta_boxes_comment', [__CLASS__, 'add_rating_meta_box']);

        // Add bulk actions
        add_filter('bulk_actions-edit-comments', [__CLASS__, 'add_bulk_actions']);
        add_filter('handle_bulk_actions-edit-comments', [__CLASS__, 'handle_bulk_actions'], 10, 3);

        // Customize comment row actions
        add_filter('comment_row_actions', [__CLASS__, 'modify_row_actions'], 10, 2);
        
        // Save rating meta box data
        add_action('edit_comment', [__CLASS__, 'save_rating_meta_box']);
        
        // Display admin notices
        add_action('admin_notices', [__CLASS__, 'display_admin_notices']);
        
        // Add Settings → Discussion integration
        add_action('admin_init', [__CLASS__, 'register_settings']);
    }

    /**
     * Add custom columns to comments list table
     */
    public static function add_custom_columns($columns) {
        // Insert rating and verified columns after author
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
                    echo '<span class="dashicons dashicons-yes-alt" style="color: #46b450;" title="' . esc_attr__('Verified Purchase', 'mebl-review-bridge') . '"></span>';
                } else {
                    echo '<span class="dashicons dashicons-minus" style="color: #ddd;" title="' . esc_attr__('Not Verified', 'mebl-review-bridge') . '"></span>';
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

                // Trigger cache update for approved reviews
                $comment = get_comment($comment_id);
                if ($comment->comment_approved === '1' && class_exists('MEBL_Rating_Aggregator')) {
                    MEBL_Rating_Aggregator::update_product_rating($comment->comment_post_ID);
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

    /**
     * Display admin notices for bulk actions
     */
    public static function display_admin_notices() {
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
    }

    /**
     * Register email notification settings in Discussion page
     */
    public static function register_settings() {
        add_settings_section(
            'mebl_review_notifications',
            __('Review Email Notifications', 'mebl-review-bridge'),
            [__CLASS__, 'render_settings_section'],
            'discussion'
        );

        add_settings_field(
            'mebl_notify_admin_new_review',
            __('Notify admin of new reviews', 'mebl-review-bridge'),
            [__CLASS__, 'render_admin_notification_field'],
            'discussion',
            'mebl_review_notifications'
        );

        add_settings_field(
            'mebl_notify_reviewer_approval',
            __('Notify reviewers of approval', 'mebl-review-bridge'),
            [__CLASS__, 'render_reviewer_notification_field'],
            'discussion',
            'mebl_review_notifications'
        );

        register_setting('discussion', 'mebl_notify_admin_new_review');
        register_setting('discussion', 'mebl_notify_reviewer_approval');
    }

    /**
     * Render settings section description
     */
    public static function render_settings_section() {
        echo '<p>' . __('Configure email notifications for product reviews.', 'mebl-review-bridge') . '</p>';
    }

    /**
     * Render admin notification field
     */
    public static function render_admin_notification_field() {
        $enabled = get_option('mebl_notify_admin_new_review', 1);
        echo '<input type="checkbox" name="mebl_notify_admin_new_review" value="1" ' . checked(1, $enabled, false) . '>';
        echo ' <label>' . __('Send email to site admin when a review is submitted', 'mebl-review-bridge') . '</label>';
    }

    /**
     * Render reviewer notification field
     */
    public static function render_reviewer_notification_field() {
        $enabled = get_option('mebl_notify_reviewer_approval', 1);
        echo '<input type="checkbox" name="mebl_notify_reviewer_approval" value="1" ' . checked(1, $enabled, false) . '>';
        echo ' <label>' . __('Send email to reviewer when their review is approved', 'mebl-review-bridge') . '</label>';
    }
}
