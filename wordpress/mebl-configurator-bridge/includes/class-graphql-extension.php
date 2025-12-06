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
                    'description' => 'DEPRECATED: Use familyId instead. This field will be removed after 2025-12-18. ID of the 3D model (backward compatibility only)',
                    'deprecationReason' => 'Use familyId field instead. The family-based variant system replaces single model references.',
                ],
                'familyId' => [
                    'type' => 'String',
                    'description' => 'ID of the 3D model family (matches FAMILY_REGISTRY key in Next.js). Families support automatic variant switching based on dimensions.',
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
                    
                    // Try new familyId field first, fallback to old modelId for backward compatibility
                    $family_id = get_post_meta($product_id, '_configurator_family_id', true);
                    $old_model_id = get_post_meta($product_id, '_configurator_model_id', true);
                    
                    // Debug logging: Log what WordPress has stored
                    error_log('[MEBL][GraphQL] Product ID: ' . $product_id);
                    error_log('[MEBL][GraphQL] _configurator_enabled: ' . ($enabled ? 'true' : 'false'));
                    error_log('[MEBL][GraphQL] _configurator_family_id: ' . ($family_id ?: 'empty'));
                    error_log('[MEBL][GraphQL] _configurator_model_id: ' . ($old_model_id ?: 'empty'));
                    
                    // Use familyId if set, otherwise fallback to old modelId
                    if (empty($family_id)) {
                        $family_id = $old_model_id;
                        error_log('[MEBL][GraphQL] Using fallback modelId as familyId: ' . $family_id);
                    }
                    
                    // Return null if configurator is not enabled or no family/model selected
                    // This follows GraphQL best practices (null for missing/disabled data)
                    if (!$enabled || empty($family_id)) {
                        error_log('[MEBL][GraphQL] Returning null (enabled=' . ($enabled ? 'true' : 'false') . ', family_id=' . ($family_id ?: 'empty') . ')');
                        return null;
                    }
                    
                    // Return configurator data with both fields for backward compatibility
                    // Frontend can use familyId preferentially, falling back to modelId during migration
                    $result = [
                        'enabled' => true,
                        'familyId' => $family_id,
                        'modelId' => $family_id,  // Backward compatibility: populate both fields
                    ];
                    
                    error_log('[MEBL][GraphQL] Returning configurator data: ' . json_encode($result));
                    
                    return $result;
                }
            ]);
        }
    }
}
