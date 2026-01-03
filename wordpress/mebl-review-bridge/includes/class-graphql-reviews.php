<?php
/**
 * WPGraphQL Schema Extension for Reviews
 * 
 * Registers GraphQL types and resolvers for product reviews.
 * Follows patterns from mebl-configurator-bridge.
 * 
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Review_GraphQL {
    
    /**
     * Initialize GraphQL hooks
     */
    public static function init() {
        error_log('[MEBL Review Bridge] GraphQL::init() called');
        
        if (!function_exists('register_graphql_object_type')) {
            error_log('[MEBL Review Bridge] ERROR: register_graphql_object_type() function not available');
            return;
        }
        
        error_log('[MEBL Review Bridge] ✓ WPGraphQL functions available');
        
        add_action('graphql_register_types', [__CLASS__, 'register_types']);
        
        error_log('[MEBL Review Bridge] ✓ Hooked into graphql_register_types');
    }
    
    /**
     * Register all GraphQL types, fields, and mutations
     */
    public static function register_types() {
        error_log('[MEBL Review Bridge] ===== register_types() CALLED =====');
        
        try {
            self::register_object_types();
            self::register_enums();
            self::register_mutations();
            
            error_log('[MEBL Review Bridge] ===== ALL TYPES REGISTERED SUCCESSFULLY =====');
        } catch (Exception $e) {
            error_log('[MEBL Review Bridge] FATAL ERROR in register_types(): ' . $e->getMessage());
            error_log('[MEBL Review Bridge] Stack trace: ' . $e->getTraceAsString());
        }
    }
    
    /**
     * Register ProductReview and related object types
     */
    private static function register_object_types() {
        error_log('[MEBL Review Bridge] Registering object types...');
        
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
            ],
        ]);
        
        error_log('[MEBL Review Bridge] ✓ ProductReview type registered');
        
        // ProductReviewEdge type
        register_graphql_object_type('ProductReviewEdge', [
            'description' => __('Edge type for review pagination', 'mebl-review-bridge'),
            'fields' => [
                'node' => [
                    'type' => ['non_null' => 'ProductReview'],
                    'description' => __('The review node', 'mebl-review-bridge'),
                ],
                'cursor' => [
                    'type' => ['non_null' => 'String'],
                    'description' => __('Cursor for pagination', 'mebl-review-bridge'),
                ],
            ],
        ]);
        
        error_log('[MEBL Review Bridge] ✓ ProductReviewEdge type registered');
        
        // ProductReviewConnection type
        register_graphql_object_type('ProductReviewConnection', [
            'description' => __('Connection type for paginated review lists', 'mebl-review-bridge'),
            'fields' => [
                'edges' => [
                    'type' => ['list_of' => 'ProductReviewEdge'],
                    'description' => __('List of review edges', 'mebl-review-bridge'),
                ],
                'pageInfo' => [
                    'type' => ['non_null' => 'PageInfo'],
                    'description' => __('Pagination metadata', 'mebl-review-bridge'),
                ],
                'totalCount' => [
                    'type' => ['non_null' => 'Int'],
                    'description' => __('Total count of approved reviews', 'mebl-review-bridge'),
                ],
            ],
        ]);
        
        error_log('[MEBL Review Bridge] ✓ ProductReviewConnection type registered');
    }
    
    /**
     * Register ReviewOrderBy enum (MVP: RECENT only)
     */
    private static function register_enums() {
        error_log('[MEBL Review Bridge] Registering enums...');
        
        register_graphql_enum_type('ReviewOrderBy', [
            'description' => __('Review sorting options', 'mebl-review-bridge'),
            'values' => [
                'RECENT' => [
                    'value' => 'recent',
                    'description' => __('Most recent first (default)', 'mebl-review-bridge'),
                ],
            ],
        ]);
        
        error_log('[MEBL Review Bridge] ✓ ReviewOrderBy enum registered');
    }
    
    /**
     * Register mutations (schema only for Phase 3, resolver in Phase 4)
     */
    private static function register_mutations() {
        error_log('[MEBL Review Bridge] Registering mutations...');
        
        // Input type for submitReview
        register_graphql_input_type('SubmitReviewInput', [
            'description' => __('Input for submitting a product review', 'mebl-review-bridge'),
            'fields' => [
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
                'clientMutationId' => [
                    'type' => 'String',
                    'description' => __('Client mutation ID for request tracking', 'mebl-review-bridge'),
                ],
            ],
        ]);
        
        // Output type for submitReview
        register_graphql_object_type('SubmitReviewPayload', [
            'description' => __('Response payload for submitReview mutation', 'mebl-review-bridge'),
            'fields' => [
                'success' => [
                    'type' => ['non_null' => 'Boolean'],
                    'description' => __('Whether submission was successful', 'mebl-review-bridge'),
                ],
                'message' => [
                    'type' => ['non_null' => 'String'],
                    'description' => __('User-facing message', 'mebl-review-bridge'),
                ],
                'review' => [
                    'type' => 'ProductReview',
                    'description' => __('The created review (null if pending moderation)', 'mebl-review-bridge'),
                ],
                'clientMutationId' => [
                    'type' => 'String',
                    'description' => __('Client mutation ID', 'mebl-review-bridge'),
                ],
            ],
        ]);
        
        // submitReview mutation (resolver implementation in Phase 4)
        register_graphql_mutation('submitReview', [
            'inputFields' => [
                'input' => [
                    'type' => ['non_null' => 'SubmitReviewInput'],
                    'description' => __('Review submission data', 'mebl-review-bridge'),
                ],
            ],
            'outputFields' => [
                'success' => [
                    'type' => ['non_null' => 'Boolean'],
                ],
                'message' => [
                    'type' => ['non_null' => 'String'],
                ],
                'review' => [
                    'type' => 'ProductReview',
                ],
                'clientMutationId' => [
                    'type' => 'String',
                ],
            ],
            'mutateAndGetPayload' => function($input, $context, $info) {
                return self::submit_review_mutation($input, $context);
            },
        ]);
        
        error_log('[MEBL Review Bridge] ✓ submitReview mutation registered (placeholder resolver)');
    }
    
    /**
     * Resolve reviews connection (paginated)
     * Uses MEBL_Review_Storage from Phase 1
     * 
     * @param object $product Product object from WPGraphQL
     * @param array $args Query arguments
     * @return array Connection data
     */
    private static function resolve_reviews_connection($product, $args) {
        $product_id = $product->databaseId;
        
        // Parse arguments
        $first = isset($args['first']) ? min((int) $args['first'], 50) : 10;
        $offset = 0;
        
        if (!empty($args['after'])) {
            $offset = MEBL_Review_Helpers::decode_cursor($args['after']);
        }
        
        // Use Phase 1 storage class to fetch reviews
        $storage_args = [
            'limit' => $first + 1, // Fetch one extra to check hasNextPage
            'offset' => $offset,
            'orderby' => 'comment_date',
            'order' => 'DESC',
        ];
        
        $reviews = MEBL_Review_Storage::get_reviews_by_product($product_id, $storage_args);
        
        if (is_wp_error($reviews)) {
            error_log('MEBL Review Bridge: Failed to fetch reviews - ' . $reviews->get_error_message());
            return [
                'edges' => [],
                'pageInfo' => [
                    'hasNextPage' => false,
                    'hasPreviousPage' => false,
                    'startCursor' => null,
                    'endCursor' => null,
                ],
                'totalCount' => 0,
            ];
        }
        
        // Check if there's a next page
        $has_next_page = count($reviews) > $first;
        if ($has_next_page) {
            array_pop($reviews); // Remove extra item
        }
        
        // Format edges
        $edges = [];
        foreach ($reviews as $index => $comment) {
            $formatted_review = MEBL_Review_Helpers::format_review($comment);
            
            if ($formatted_review) {
                $edges[] = [
                    'node' => $formatted_review,
                    'cursor' => MEBL_Review_Helpers::encode_cursor($offset + $index + 1),
                ];
            }
        }
        
        // Get total count from cache
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
     * Submit review mutation handler (Phase 4)
     * 
     * Handles review submission with comprehensive validation,
     * verified purchase check, and metadata storage.
     * 
     * Note: This implementation always returns clientMutationId in the response
     * (even on errors) to improve request tracking. This is an intentional
     * enhancement over the canonical spec for better client-side error handling.
     * 
     * @param array  $input   Mutation input
     * @param object $context GraphQL context
     * @return array Mutation payload
     */
    private static function submit_review_mutation($input, $context) {
        // Validation
        $validation = MEBL_Review_Validation::validate_submission($input, $context);
        
        if (!$validation['valid']) {
            return [
                'success' => false,
                'message' => $validation['message'],
                'review' => null,
                'clientMutationId' => $input['clientMutationId'] ?? null,
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
        
        // Sanitize content
        $content = wp_kses_post($input['content']);
        
        // Insert comment
        $comment_data = [
            'comment_post_ID' => $product_id,
            'comment_author' => $user->display_name,
            'comment_author_email' => $user->user_email,
            'comment_content' => $content,
            'user_id' => $user->ID,
            'comment_type' => 'review',
            'comment_approved' => 0, // Pending moderation
            'comment_date' => current_time('mysql'),
            'comment_date_gmt' => current_time('mysql', 1),
            'comment_author_IP' => !empty($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '',
            'comment_agent' => !empty($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '',
        ];
        
        $comment_id = wp_insert_comment($comment_data);
        
        if (!$comment_id || is_wp_error($comment_id)) {
            // Log detailed error for debugging
            $error_message = is_wp_error($comment_id) ? $comment_id->get_error_message() : 'Unknown error';
            error_log(sprintf(
                'MEBL Review Bridge: Failed to insert review comment. Product ID: %d, User ID: %d, Error: %s',
                $product_id,
                $user->ID,
                $error_message
            ));
            
            return [
                'success' => false,
                'message' => __('Failed to submit review. Please try again.', 'mebl-review-bridge'),
                'review' => null,
                'clientMutationId' => $input['clientMutationId'] ?? null,
            ];
        }
        
        // Store metadata
        $rating_updated = update_comment_meta($comment_id, 'rating', (int) $input['rating']);
        $verified_updated = update_comment_meta($comment_id, 'verified', $verified ? '1' : '0');
        $helpful_updated = update_comment_meta($comment_id, 'helpful', 0);
        
        // Log metadata update failures for debugging
        if ($rating_updated === false || $verified_updated === false || $helpful_updated === false) {
            error_log(sprintf(
                'MEBL Review Bridge: Metadata update failed for review %d. Rating: %s, Verified: %s, Helpful: %s',
                $comment_id,
                $rating_updated === false ? 'FAILED' : 'OK',
                $verified_updated === false ? 'FAILED' : 'OK',
                $helpful_updated === false ? 'FAILED' : 'OK'
            ));
        }
        
        // Trigger action hook for extensibility
        do_action('mebl_review_submitted', $comment_id, $product_id);
        
        return [
            'success' => true,
            'message' => __('Review submitted successfully and is awaiting moderation.', 'mebl-review-bridge'),
            'review' => null, // Don't return review until approved
            'clientMutationId' => $input['clientMutationId'] ?? null,
        ];
    }
}
