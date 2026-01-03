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
                // Phase 4 will implement this
                return [
                    'success' => false,
                    'message' => __('Review submission not yet implemented (Phase 4)', 'mebl-review-bridge'),
                    'review' => null,
                    'clientMutationId' => $input['clientMutationId'] ?? null,
                ];
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
}
