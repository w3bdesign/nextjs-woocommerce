<?php
/**
 * Email Notifications for Review System
 * 
 * Handles email notifications for administrators and reviewers
 * with HTML templates and extensibility hooks.
 * 
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Email_Notifications {

    /**
     * Initialize email notification hooks
     */
    public static function init() {
        // Admin notification on review submission (Phase 4 hook)
        add_action('mebl_review_submitted', [__CLASS__, 'notify_admin_new_review'], 10, 3);

        // Reviewer notifications on status change
        add_action('transition_comment_status', [__CLASS__, 'notify_reviewer_approved'], 10, 3);
        add_action('transition_comment_status', [__CLASS__, 'notify_reviewer_rejected'], 10, 3);
        
        // Custom action hook for approval
        add_action('transition_comment_status', [__CLASS__, 'fire_custom_approval_hook'], 10, 3);
        
        // Apply settings filters
        add_filter('mebl_review_admin_notification_enabled', [__CLASS__, 'check_admin_notification_setting']);
        add_filter('mebl_review_reviewer_notification_enabled', [__CLASS__, 'check_reviewer_notification_setting']);
    }

    /**
     * Send admin email notification for new review
     * Hooks into mebl_review_submitted action from Phase 4
     * 
     * @param int $comment_id Comment ID
     * @param int $product_id Product ID
     * @param int $user_id User ID
     */
    public static function notify_admin_new_review($comment_id, $product_id, $user_id) {
        // Check if admin notifications are enabled
        if (!apply_filters('mebl_review_admin_notification_enabled', true)) {
            return;
        }

        $comment = get_comment($comment_id);
        $product = wc_get_product($product_id);
        $user = get_userdata($user_id);
        
        if (!$comment || !$product) {
            return;
        }

        // Get user data - handle both registered and guest users
        if ($user) {
            $user_display_name = $user->display_name;
            $user_email = $user->user_email;
        } else {
            // Fallback for guest users (should not happen with current mutation but defensive)
            $user_display_name = $comment->comment_author;
            $user_email = $comment->comment_author_email;
        }

        // Get admin email (filterable for custom recipients)
        $admin_email = apply_filters('mebl_review_admin_email', get_option('admin_email'));

        // Build email content
        $rating = get_comment_meta($comment_id, 'rating', true);
        $verified = get_comment_meta($comment_id, 'verified', true) === '1';

        $subject = sprintf(
            __('[%s] New Review Pending Approval', 'mebl-review-bridge'),
            get_bloginfo('name')
        );

        // Build HTML email
        $message = self::build_admin_notification_html(
            $product,
            $comment,
            $user_display_name,
            $user_email,
            $rating,
            $verified
        );

        // Allow filtering of message content
        $message = apply_filters('mebl_review_admin_notification_message', $message, $comment, $product, $user);

        // Send email with HTML headers
        $headers = ['Content-Type: text/html; charset=UTF-8'];
        wp_mail($admin_email, $subject, $message, $headers);
    }

    /**
     * Send email to reviewer when their review is approved
     * 
     * @param string $new_status New comment status
     * @param string $old_status Old comment status
     * @param object $comment Comment object
     */
    public static function notify_reviewer_approved($new_status, $old_status, $comment) {
        // Only for reviews transitioning to approved
        if ($comment->comment_type !== 'review') {
            return;
        }

        if ($new_status !== 'approved' || $old_status === 'approved') {
            return;
        }

        // Check if reviewer notifications are enabled
        if (!apply_filters('mebl_review_reviewer_notification_enabled', true)) {
            return;
        }

        $product_id = $comment->comment_post_ID;
        $product = wc_get_product($product_id);

        if (!$product) {
            return;
        }

        $reviewer_email = $comment->comment_author_email;
        $reviewer_name = $comment->comment_author;

        $subject = sprintf(
            __('[%s] Your Review Has Been Approved', 'mebl-review-bridge'),
            get_bloginfo('name')
        );

        $product_url = get_permalink($product_id);

        // Build HTML email
        $message = self::build_approval_notification_html(
            $reviewer_name,
            $product,
            $product_url
        );

        // Allow filtering of message content
        $message = apply_filters('mebl_review_reviewer_notification_message', $message, $comment, $product);

        // Send email with HTML headers
        $headers = ['Content-Type: text/html; charset=UTF-8'];
        wp_mail($reviewer_email, $subject, $message, $headers);
    }

    /**
     * Send email to reviewer when their review is rejected
     * Optional feature - disabled by default
     * 
     * @param string $new_status New comment status
     * @param string $old_status Old comment status
     * @param object $comment Comment object
     */
    public static function notify_reviewer_rejected($new_status, $old_status, $comment) {
        // Only for reviews transitioning to rejected/trash
        if ($comment->comment_type !== 'review') {
            return;
        }

        if (!in_array($new_status, ['trash', 'spam']) || in_array($old_status, ['trash', 'spam'])) {
            return;
        }

        // Rejection notifications disabled by default
        if (!apply_filters('mebl_review_rejection_notification_enabled', false)) {
            return;
        }

        // Don't notify for spam
        if ($new_status === 'spam') {
            return;
        }

        $product_id = $comment->comment_post_ID;
        $product = wc_get_product($product_id);

        if (!$product) {
            return;
        }

        $reviewer_email = $comment->comment_author_email;
        $reviewer_name = $comment->comment_author;

        $subject = sprintf(
            __('[%s] Review Update', 'mebl-review-bridge'),
            get_bloginfo('name')
        );

        // Build HTML email
        $message = self::build_rejection_notification_html(
            $reviewer_name,
            $product
        );

        // Allow filtering of message content
        $message = apply_filters('mebl_review_rejection_notification_message', $message, $comment, $product);

        // Send email with HTML headers
        $headers = ['Content-Type: text/html; charset=UTF-8'];
        wp_mail($reviewer_email, $subject, $message, $headers);
    }

    /**
     * Fire custom mebl_review_approved action hook
     * 
     * @param string $new_status New comment status
     * @param string $old_status Old comment status
     * @param object $comment Comment object
     */
    public static function fire_custom_approval_hook($new_status, $old_status, $comment) {
        if ($comment->comment_type === 'review' && $new_status === 'approved' && $old_status !== 'approved') {
            do_action('mebl_review_approved', $comment->comment_ID, $comment->comment_post_ID, $comment->user_id);
        }
    }

    /**
     * Check admin notification setting
     * 
     * @param bool $enabled Current enabled status
     * @return bool
     */
    public static function check_admin_notification_setting($enabled) {
        return (bool) get_option('mebl_notify_admin_new_review', 1);
    }

    /**
     * Check reviewer notification setting
     * 
     * @param bool $enabled Current enabled status
     * @return bool
     */
    public static function check_reviewer_notification_setting($enabled) {
        return (bool) get_option('mebl_notify_reviewer_approval', 1);
    }

    /**
     * Build HTML email template for admin notification
     * 
     * @param object $product Product object
     * @param object $comment Comment object
     * @param string $user_display_name User display name
     * @param string $user_email User email
     * @param int $rating Rating value
     * @param bool $verified Verified purchase status
     * @return string HTML email content
     */
    private static function build_admin_notification_html($product, $comment, $user_display_name, $user_email, $rating, $verified) {
        $site_name = get_bloginfo('name');
        $product_name = esc_html($product->get_name());
        $reviewer_name = esc_html($user_display_name);
        $reviewer_email = esc_html($user_email);
        $rating_stars = str_repeat('★', (int)$rating);
        $verified_text = $verified ? __('Yes', 'mebl-review-bridge') : __('No', 'mebl-review-bridge');
        $content_preview = esc_html(wp_trim_words($comment->comment_content, 50));
        $moderation_url = esc_url(admin_url("comment.php?action=approve&c={$comment->comment_ID}"));

        return '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: #0073aa; color: #fff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #ffffff; }
        .content h2 { color: #0073aa; margin-top: 0; }
        .info-table { width: 100%; margin: 20px 0; }
        .info-table td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
        .info-table td:first-child { font-weight: bold; width: 150px; }
        .review-content { background: #f9f9f9; padding: 15px; border-left: 4px solid #0073aa; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #0073aa; color: #fff !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>' . esc_html($site_name) . '</h1>
        </div>
        <div class="content">
            <h2>' . __('New Review Pending Approval', 'mebl-review-bridge') . '</h2>
            <p>' . __('A new review has been submitted and is awaiting moderation.', 'mebl-review-bridge') . '</p>
            
            <table class="info-table">
                <tr>
                    <td>' . __('Product', 'mebl-review-bridge') . '</td>
                    <td>' . $product_name . '</td>
                </tr>
                <tr>
                    <td>' . __('Reviewer', 'mebl-review-bridge') . '</td>
                    <td>' . $reviewer_name . ' (' . $reviewer_email . ')</td>
                </tr>
                <tr>
                    <td>' . __('Rating', 'mebl-review-bridge') . '</td>
                    <td>' . $rating_stars . ' (' . $rating . '/5 ' . __('stars', 'mebl-review-bridge') . ')</td>
                </tr>
                <tr>
                    <td>' . __('Verified Purchase', 'mebl-review-bridge') . '</td>
                    <td>' . $verified_text . '</td>
                </tr>
            </table>
            
            <div class="review-content">
                <strong>' . __('Review Content:', 'mebl-review-bridge') . '</strong><br>
                ' . $content_preview . '
            </div>
            
            <p style="text-align: center;">
                <a href="' . $moderation_url . '" class="button">' . __('Moderate This Review', 'mebl-review-bridge') . '</a>
            </p>
        </div>
        <div class="footer">
            <p>' . sprintf(__('This email was sent from %s', 'mebl-review-bridge'), esc_html($site_name)) . '</p>
        </div>
    </div>
</body>
</html>';
    }

    /**
     * Build HTML email template for review approval
     * 
     * @param string $reviewer_name Reviewer name
     * @param object $product Product object
     * @param string $product_url Product URL
     * @return string HTML email content
     */
    private static function build_approval_notification_html($reviewer_name, $product, $product_url) {
        $site_name = get_bloginfo('name');
        $product_name = esc_html($product->get_name());
        $reviewer_name_escaped = esc_html($reviewer_name);
        $product_url_escaped = esc_url($product_url);

        return '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: #0073aa; color: #fff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #ffffff; }
        .content h2 { color: #0073aa; margin-top: 0; }
        .button { display: inline-block; padding: 12px 24px; background: #0073aa; color: #fff !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>' . esc_html($site_name) . '</h1>
        </div>
        <div class="content">
            <h2>' . __('Your Review Has Been Approved!', 'mebl-review-bridge') . '</h2>
            <p>' . sprintf(__('Hi %s,', 'mebl-review-bridge'), $reviewer_name_escaped) . '</p>
            <p>' . sprintf(__('Great news! Your review for <strong>%s</strong> has been approved and is now visible to other customers.', 'mebl-review-bridge'), $product_name) . '</p>
            
            <p style="text-align: center;">
                <a href="' . $product_url_escaped . '" class="button">' . __('View Your Review', 'mebl-review-bridge') . '</a>
            </p>
            
            <p>' . __('Thank you for sharing your feedback!', 'mebl-review-bridge') . '</p>
            <p>' . sprintf(__('- The %s Team', 'mebl-review-bridge'), esc_html($site_name)) . '</p>
        </div>
        <div class="footer">
            <p>' . sprintf(__('This email was sent from %s', 'mebl-review-bridge'), esc_html($site_name)) . '</p>
        </div>
    </div>
</body>
</html>';
    }

    /**
     * Build HTML email template for review rejection
     * 
     * @param string $reviewer_name Reviewer name
     * @param object $product Product object
     * @return string HTML email content
     */
    private static function build_rejection_notification_html($reviewer_name, $product) {
        $site_name = get_bloginfo('name');
        $product_name = esc_html($product->get_name());
        $reviewer_name_escaped = esc_html($reviewer_name);

        return '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: #0073aa; color: #fff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #ffffff; }
        .content h2 { color: #0073aa; margin-top: 0; }
        .guidelines { background: #f9f9f9; padding: 15px; border-left: 4px solid #dc3232; margin: 20px 0; }
        .guidelines ul { margin: 10px 0; padding-left: 20px; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>' . esc_html($site_name) . '</h1>
        </div>
        <div class="content">
            <h2>' . __('Review Update', 'mebl-review-bridge') . '</h2>
            <p>' . sprintf(__('Hi %s,', 'mebl-review-bridge'), $reviewer_name_escaped) . '</p>
            <p>' . sprintf(__('Thank you for submitting a review for <strong>%s</strong>.', 'mebl-review-bridge'), $product_name) . '</p>
            <p>' . __('Unfortunately, we were unable to approve your review as it did not meet our community guidelines.', 'mebl-review-bridge') . '</p>
            
            <div class="guidelines">
                <strong>' . __('Common reasons for rejection:', 'mebl-review-bridge') . '</strong>
                <ul>
                    <li>' . __('Contains promotional content or links', 'mebl-review-bridge') . '</li>
                    <li>' . __('Includes personal contact information', 'mebl-review-bridge') . '</li>
                    <li>' . __('Does not relate to the product', 'mebl-review-bridge') . '</li>
                </ul>
            </div>
            
            <p>' . __('If you have questions, please contact us.', 'mebl-review-bridge') . '</p>
            <p>' . sprintf(__('- The %s Team', 'mebl-review-bridge'), esc_html($site_name)) . '</p>
        </div>
        <div class="footer">
            <p>' . sprintf(__('This email was sent from %s', 'mebl-review-bridge'), esc_html($site_name)) . '</p>
        </div>
    </div>
</body>
</html>';
    }
}
