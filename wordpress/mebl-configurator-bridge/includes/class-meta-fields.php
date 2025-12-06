<?php
/**
 * Product Meta Fields Handler
 * Adds 3D configurator settings to WooCommerce product edit screen
 */

if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Configurator_Meta_Fields {
    
    /**
     * Available 3D model families
     * 
     * ⚠️ IMPORTANT: Update this array when you add new model families to your Next.js app!
     * 
     * NEW (v2.0): Family-based variant system
     * - Each family contains multiple model variants that automatically switch based on dimensions
     * - Width/height changes trigger variant switching (depth does not)
     * 
     * How to add a new family:
     * 1. Create family config in Next.js app (e.g., src/config/families/sofaFamily.config.ts)
     * 2. Register it in src/config/families.registry.ts
     * 3. Add a line below with the EXACT same familyId
     * 
     * Format: 'family-id-from-nextjs' => 'Display Name for WordPress Admin'
     * 
     * MIGRATION NOTE: Products using old '_configurator_model_id' field (cabinet-v1, dresser-v1) 
     * will continue to work during transition period. New products should use families.
     */
    private static $available_families = [
        'cabinet-family-01' => '🗄️ Cabinet Series A (Multi-variant)',
        'dresser-family-01' => '🪑 Dresser Series A (Multi-variant)',
        
        // 📝 ADD YOUR NEW FAMILIES HERE:
        // 'sofa-family-modern' => '🛋️ Modern Sofa Collection',
        // 'chair-family-office' => '💺 Office Chair Collection',
        // 'table-family-dining' => '🪑 Dining Table Collection',
    ];
    
    /**
     * Initialize WordPress hooks
     */
    public static function init() {
        // Add meta box to product edit screen
        add_action('add_meta_boxes', [__CLASS__, 'add_meta_box']);
        
        // Save meta fields when product is saved
        add_action('save_post', [__CLASS__, 'save_meta_fields'], 10, 2);
        
        // Add column to products list table
        add_filter('manage_product_posts_columns', [__CLASS__, 'add_column']);
        add_action('manage_product_posts_custom_column', [__CLASS__, 'render_column'], 10, 2);
        
        // Add admin styles
        add_action('admin_head', [__CLASS__, 'admin_styles']);
    }
    
    /**
     * Add meta box to product edit screen
     */
    public static function add_meta_box() {
        add_meta_box(
            'mebl_configurator_settings',
            '🎨 3D Configurator Settings',
            [__CLASS__, 'render_meta_box'],
            'product',
            'side',
            'high'
        );
    }
    
    /**
     * Render the meta box content
     */
    public static function render_meta_box($post) {
        // Security: Add nonce field
        wp_nonce_field('mebl_configurator_save', 'mebl_configurator_nonce');
        
        // Get current saved values
        $enabled = get_post_meta($post->ID, '_configurator_enabled', true);
        $family_id = get_post_meta($post->ID, '_configurator_family_id', true);
        
        // Backward compatibility: Check for old model_id field
        if (empty($family_id)) {
            $family_id = get_post_meta($post->ID, '_configurator_model_id', true);
        }
        
        // Check if family ID is still valid (in case it was removed from the list)
        $family_exists = empty($family_id) || array_key_exists($family_id, self::$available_families);
        
        ?>
        <div class="mebl-configurator-metabox">
            
            <!-- Enable/Disable Toggle -->
            <div class="mebl-setting">
                <label class="mebl-toggle">
                    <input 
                        type="checkbox" 
                        name="mebl_configurator_enabled" 
                        id="mebl_configurator_enabled"
                        value="1" 
                        <?php checked($enabled, '1'); ?>
                    >
                    <span class="mebl-toggle-label">
                        <strong>Enable 3D Configurator</strong>
                    </span>
                </label>
                <p class="description">
                    When enabled, customers will see an interactive 3D model instead of a static product image.
                </p>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            
            <!-- Model Family Selector -->
            <div class="mebl-setting">
                <label for="mebl_configurator_family_id">
                    <strong>Select 3D Model Family:</strong>
                </label>
                <select 
                    name="mebl_configurator_family_id" 
                    id="mebl_configurator_family_id"
                    class="widefat"
                >
                    <option value="">— Choose a model family —</option>
                    <?php foreach (self::$available_families as $id => $name): ?>
                        <option value="<?php echo esc_attr($id); ?>" <?php selected($family_id, $id); ?>>
                            <?php echo esc_html($name); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="description">
                    This ID must match exactly with your Next.js FAMILY_REGISTRY. Families support automatic variant switching based on customer-selected dimensions.
                </p>
            </div>
            
            <!-- Warnings/Errors -->
            <?php if ($enabled === '1' && empty($family_id)): ?>
                <div class="mebl-warning">
                    ⚠️ <strong>Warning:</strong> Configurator is enabled but no model family is selected. Customers won't see the 3D view.
                </div>
            <?php endif; ?>
            
            <?php if (!empty($family_id) && !$family_exists): ?>
                <div class="mebl-error">
                    ❌ <strong>Error:</strong> The selected model family "<?php echo esc_html($family_id); ?>" no longer exists in the plugin. Please select a valid model family.
                </div>
            <?php endif; ?>
            
            <!-- Help Section -->
            <?php if (!$enabled || empty($model_id)): ?>
                <div class="mebl-help">
                    <p><strong>💡 Quick Start:</strong></p>
                    <ol style="margin: 10px 0; padding-left: 20px; font-size: 12px;">
                        <li>Check "Enable 3D Configurator" above</li>
                        <li>Select a 3D model from the dropdown</li>
                        <li>Click "Update" to save your changes</li>
                        <li>View the product on your website to see the configurator</li>
                    </ol>
                </div>
            <?php else: ?>
                <div class="mebl-success">
                    ✅ Configurator is active! Model Family: <strong><?php echo esc_html(self::$available_families[$family_id] ?? $family_id); ?></strong>
                </div>
            <?php endif; ?>
            
        </div>
        <?php
    }
    
    /**
     * Save meta box data
     * 
     * @param int     $post_id Post ID.
     * @param WP_Post $post    Post object.
     */
    public static function save_meta_fields($post_id, $post) {
        // Only run for product post type
        if (!isset($post->post_type) || 'product' !== $post->post_type) {
            return;
        }
        
        // Check if our nonce is set
        if (!isset($_POST['mebl_configurator_nonce'])) {
            return;
        }
        
        // Verify that the nonce is valid
        if (!wp_verify_nonce($_POST['mebl_configurator_nonce'], 'mebl_configurator_save')) {
            return;
        }
        
        // If this is an autosave, our form has not been submitted, so we don't want to do anything
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        // Check if not an autosave (using WordPress helper function)
        if (wp_is_post_autosave($post_id)) {
            return;
        }
        
        // Check if not a revision
        if (wp_is_post_revision($post_id)) {
            return;
        }
        
        // Check the user's permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        /* OK, it's safe for us to save the data now. */
        
        // Save enabled status
        $enabled = isset($_POST['mebl_configurator_enabled']) ? '1' : '0';
        update_post_meta($post_id, '_configurator_enabled', $enabled);
        
        // Save family ID (with validation)
        if (isset($_POST['mebl_configurator_family_id'])) {
            $family_id = sanitize_text_field($_POST['mebl_configurator_family_id']);
            
            // Validate: Only save if empty or exists in available families
            if (empty($family_id) || array_key_exists($family_id, self::$available_families)) {
                update_post_meta($post_id, '_configurator_family_id', $family_id);
            } else {
                // Invalid family ID - log error
                error_log('MEBL Configurator: Invalid family ID attempted: ' . $family_id);
            }
        }
    }
    
    /**
     * Add column to products list
     */
    public static function add_column($columns) {
        // Insert after the product name column
        $new_columns = [];
        foreach ($columns as $key => $value) {
            $new_columns[$key] = $value;
            if ($key === 'name') {
                $new_columns['mebl_configurator'] = '🎨 3D Model';
            }
        }
        return $new_columns;
    }
    
    /**
     * Render column content
     */
    public static function render_column($column, $post_id) {
        if ($column === 'mebl_configurator') {
            $enabled = get_post_meta($post_id, '_configurator_enabled', true);
            $family_id = get_post_meta($post_id, '_configurator_family_id', true);
            
            // Backward compatibility: Check for old model_id field
            if (empty($family_id)) {
                $family_id = get_post_meta($post_id, '_configurator_model_id', true);
            }
            
            if ($enabled === '1' && !empty($family_id)) {
                $family_name = self::$available_families[$family_id] ?? $family_id;
                echo '<span style="color: #2271b1;">✓ ' . esc_html($family_name) . '</span>';
            } else {
                echo '<span style="color: #dba617;">—</span>';
            }
        }
    }
    
    /**
     * Add admin styles
     */
    public static function admin_styles() {
        global $post_type;
        if ($post_type === 'product') {
            ?>
            <style>
                .mebl-configurator-metabox {
                    padding: 10px 0;
                }
                .mebl-setting {
                    margin-bottom: 15px;
                }
                .mebl-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .mebl-toggle input[type="checkbox"] {
                    margin: 0;
                }
                .mebl-warning {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 10px;
                    margin: 15px 0;
                    font-size: 12px;
                }
                .mebl-error {
                    background: #f8d7da;
                    border-left: 4px solid #dc3545;
                    padding: 10px;
                    margin: 15px 0;
                    font-size: 12px;
                }
                .mebl-success {
                    background: #d4edda;
                    border-left: 4px solid #28a745;
                    padding: 10px;
                    margin: 15px 0;
                    font-size: 12px;
                }
                .mebl-help {
                    background: #e7f3ff;
                    border-left: 4px solid #2271b1;
                    padding: 10px;
                    margin: 15px 0;
                    font-size: 12px;
                }
                #mebl_configurator_settings .inside {
                    margin: 0;
                    padding: 0;
                }
            </style>
            <?php
        }
    }
    
    /**
     * Get available families (public API for GraphQL and other integrations)
     */
    public static function get_available_families() {
        return self::$available_families;
    }
    
    /**
     * Get family ID for a product (with backward compatibility)
     * 
     * @param int $product_id WooCommerce product ID
     * @return string|null Family ID or null if not set
     */
    public static function get_product_family_id($product_id) {
        // Try new family_id field first
        $family_id = get_post_meta($product_id, '_configurator_family_id', true);
        
        // Fallback to old model_id field for backward compatibility
        if (empty($family_id)) {
            $family_id = get_post_meta($product_id, '_configurator_model_id', true);
        }
        
        return !empty($family_id) ? $family_id : null;
    }
}
