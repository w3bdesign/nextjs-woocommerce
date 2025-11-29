<?php
/**
 * WPGraphQL Schema Extension
 * Exposes configurator settings via GraphQL for the Next.js frontend
 */

if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Configurator_GraphQL {
    
    /**
     * Initialize GraphQL hooks
     */
    public static function init() {
        add_action('graphql_register_types', [__CLASS__, 'register_types']);
    }
    
    /**
     * Register GraphQL types and fields
     */
    public static function register_types() {
        // Register ProductConfigurator object type
        register_graphql_object_type('ProductConfigurator', [
            'description' => '3D Configurator settings for a product',
            'fields' => [
                'enabled' => [
                    'type' => 'Boolean',
                    'description' => 'Whether the 3D configurator is enabled for this product',
                ],
                'modelId' => [
                    'type' => 'String',
                    'description' => 'ID of the 3D model to use (matches MODEL_REGISTRY key in Next.js)',
                ],
            ],
        ]);
        
        // Add configurator field to all WooCommerce product types
        $product_types = [
            'SimpleProduct',
            'VariableProduct',
            'ExternalProduct',
            'GroupProduct'
        ];
        
        foreach ($product_types as $type) {
            register_graphql_field($type, 'configurator', [
                'type' => 'ProductConfigurator',
                'description' => '3D Configurator configuration for this product',
                'resolve' => function($product) {
                    $product_id = $product->databaseId;
                    
                    // Get meta values from WordPress
                    $enabled = get_post_meta($product_id, '_configurator_enabled', true) === '1';
                    $model_id = get_post_meta($product_id, '_configurator_model_id', true);
                    
                    // Return null if configurator is not enabled or no model selected
                    // This follows GraphQL best practices (null for missing/disabled data)
                    if (!$enabled || empty($model_id)) {
                        return null;
                    }
                    
                    // Return configurator data
                    return [
                        'enabled' => true,
                        'modelId' => $model_id,
                    ];
                }
            ]);
        }
    }
}
