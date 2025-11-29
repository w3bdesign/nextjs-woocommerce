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
     * Available 3D models
     * 
     * ⚠️ IMPORTANT: Update this array when you add new models to your Next.js app!
     * 
     * How to add a new model:
     * 1. Add model config to your Next.js app (e.g., src/config/sofaModel.config.ts)
     * 2. Register it in src/config/models.registry.ts
     * 3. Add a line below with the EXACT same model ID
     * 
     * Format: 'model-id-from-nextjs' => 'Display Name for WordPress Admin'
     */
    private static $available_models = [
        'cabinet-v1' => '🗄️ Bar Cabinet (v1)',
        'dresser-v1' => '🪑 Bedroom Dresser (v1)',
        
        // 📝 ADD YOUR NEW MODELS HERE:
        // 'sofa-modern-v1' => '🛋️ Modern Sofa',
        // 'chair-office-v1' => '💺 Office Chair',
        // 'table-dining-v1' => '🪑 Dining Table',
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
        $model_id = get_post_meta($post->ID, '_configurator_model_id', true);
        
        // Check if model ID is still valid (in case it was removed from the list)
        $model_exists = empty($model_id) || array_key_exists($model_id, self::$available_models);
        
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
            
            <!-- Model Selector -->
            <div class="mebl-setting">
                <label for="mebl_configurator_model_id">
                    <strong>Select 3D Model:</strong>
                </label>
                <select 
                    name="mebl_configurator_model_id" 
                    id="mebl_configurator_model_id"
                    class="widefat"
                >
                    <option value="">— Choose a model —</option>
                    <?php foreach (self::$available_models as $id => $name): ?>
                        <option value="<?php echo esc_attr($id); ?>" <?php selected($model_id, $id); ?>>
                            <?php echo esc_html($name); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="description">
                    This ID must match exactly with your Next.js MODEL_REGISTRY.
                </p>
            </div>
            
            <!-- Warnings/Errors -->
            <?php if ($enabled === '1' && empty($model_id)): ?>
                <div class="mebl-warning">
                    ⚠️ <strong>Warning:</strong> Configurator is enabled but no model is selected. Customers won't see the 3D view.
                </div>
            <?php endif; ?>
            
            <?php if (!empty($model_id) && !$model_exists): ?>
                <div class="mebl-error">
                    ❌ <strong>Error:</strong> The selected model "<?php echo esc_html($model_id); ?>" no longer exists in the plugin. Please select a valid model.
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
                    ✅ Configurator is active! Model: <strong><?php echo esc_html(self::$available_models[$model_id] ?? $model_id); ?></strong>
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
        
        // Save model ID (with validation)
        if (isset($_POST['mebl_configurator_model_id'])) {
            $model_id = sanitize_text_field($_POST['mebl_configurator_model_id']);
            
            // Validate: Only save if empty or exists in available models
            if (empty($model_id) || array_key_exists($model_id, self::$available_models)) {
                update_post_meta($post_id, '_configurator_model_id', $model_id);
            } else {
                // Invalid model ID - log error
                error_log('MEBL Configurator: Invalid model ID attempted: ' . $model_id);
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
            $model_id = get_post_meta($post_id, '_configurator_model_id', true);
            
            if ($enabled === '1' && !empty($model_id)) {
                $model_name = self::$available_models[$model_id] ?? $model_id;
                echo '<span style="color: #2271b1;">✓ ' . esc_html($model_name) . '</span>';
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
     * Get available models (public API for potential future use)
     */
    public static function get_available_models() {
        return self::$available_models;
    }
}
