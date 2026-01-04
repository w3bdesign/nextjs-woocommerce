<?php
/**
 * GraphQL Schema Extensions
 *
 * Adds custom fields to WPGraphQL Comment type for review rating and verification.
 *
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

namespace MEBL\ReviewBridge;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * GraphQL Schema Extension Class
 */
class GraphQL_Schema {

    /**
     * Initialize GraphQL schema extensions
     */
    public function __construct() {
        add_action('graphql_register_types', [$this, 'register_comment_fields']);
    }

    /**
     * Register custom fields for Comment type
     *
     * Exposes rating and verified fields stored in comment meta.
     */
    public function register_comment_fields() {
        // Register rating field
        register_graphql_field('Comment', 'rating', [
            'type' => 'Int',
            'description' => __('Review rating (1-5 stars)', 'mebl-review-bridge'),
            'resolve' => function($comment) {
                $rating = get_comment_meta($comment->comment_ID, 'rating', true);
                return $rating ? (int) $rating : null;
            }
        ]);

        // Register verified field
        register_graphql_field('Comment', 'verified', [
            'type' => 'Boolean',
            'description' => __('Whether the reviewer is a verified purchaser', 'mebl-review-bridge'),
            'resolve' => function($comment) {
                $verified = get_comment_meta($comment->comment_ID, 'verified', true);
                return (bool) $verified;
            }
        ]);
    }
}
