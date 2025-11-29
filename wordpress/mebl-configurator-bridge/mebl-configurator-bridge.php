<?php
/**
 * Plugin Name: MEBL 3D Configurator Bridge
 * Plugin URI: https://github.com/szpeqq/mebl
 * Description: Connects WooCommerce products to 3D configurator models. Simple dropdown selector in product editor.
 * Version: 1.0.0
 * Author: MEBL Team
 * Author URI: https://yoursite.com
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Requires Plugins: woocommerce
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: mebl-configurator
 * Domain Path: /languages
 * 
 * WC requires at least: 7.0
 * WC tested up to: 9.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MEBL_CONFIGURATOR_VERSION', '1.0.0');
define('MEBL_CONFIGURATOR_PATH', plugin_dir_path(__FILE__));
define('MEBL_CONFIGURATOR_URL', plugin_dir_url(__FILE__));

/**
 * Check if required plugins are active
 */
function mebl_configurator_check_dependencies() {
    $missing_plugins = [];
    
    // Check WooCommerce
    if (!class_exists('WooCommerce')) {
        $missing_plugins[] = '<a href="' . admin_url('plugin-install.php?s=woocommerce&tab=search&type=term') . '">WooCommerce</a>';
    }
    
    // Check WPGraphQL (soft requirement)
    if (!class_exists('WPGraphQL')) {
        add_action('admin_notices', 'mebl_configurator_graphql_notice');
    }
    
    // Show error and deactivate if WooCommerce is missing
    if (!empty($missing_plugins)) {
        add_action('admin_notices', function() use ($missing_plugins) {
            ?>
            <div class="notice notice-error">
                <p>
                    <strong><?php echo esc_html__('MEBL 3D Configurator Bridge', 'mebl-configurator'); ?></strong> 
                    <?php echo esc_html__('requires the following plugins to be installed and activated:', 'mebl-configurator'); ?>
                    <?php echo wp_kses_post(implode(', ', $missing_plugins)); ?>
                </p>
            </div>
            <?php
        });
        
        // Deactivate this plugin
        deactivate_plugins(plugin_basename(__FILE__));
        return false;
    }
    
    return true;
}

/**
 * Show warning if WPGraphQL is not active
 */
function mebl_configurator_graphql_notice() {
    ?>
    <div class="notice notice-warning is-dismissible">
        <p>
            <strong><?php echo esc_html__('MEBL 3D Configurator Bridge:', 'mebl-configurator'); ?></strong> 
            <a href="<?php echo esc_url(admin_url('plugin-install.php?s=wpgraphql&tab=search&type=term')); ?>"><?php echo esc_html__('WPGraphQL', 'mebl-configurator'); ?></a> 
            <?php echo esc_html__('is recommended for full functionality. The plugin will work, but your frontend won\'t be able to fetch configurator data via GraphQL.', 'mebl-configurator'); ?>
        </p>
    </div>
    <?php
}

/**
 * Load plugin classes
 */
function mebl_configurator_load_classes() {
    require_once MEBL_CONFIGURATOR_PATH . 'includes/class-meta-fields.php';
    
    // Only load GraphQL extension if WPGraphQL is active
    if (class_exists('WPGraphQL')) {
        require_once MEBL_CONFIGURATOR_PATH . 'includes/class-graphql-extension.php';
    }
}

/**
 * Initialize plugin
 */
function mebl_configurator_init() {
    // Check dependencies first
    if (!mebl_configurator_check_dependencies()) {
        return;
    }
    
    // Load classes
    mebl_configurator_load_classes();
    
    // Initialize meta fields
    MEBL_Configurator_Meta_Fields::init();
    
    // Initialize GraphQL extension if available
    if (class_exists('WPGraphQL') && class_exists('MEBL_Configurator_GraphQL')) {
        MEBL_Configurator_GraphQL::init();
    }
}

// Hook into WordPress
add_action('plugins_loaded', 'mebl_configurator_init');

/**
 * Declare compatibility with WooCommerce features
 */
add_action('before_woocommerce_init', function() {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
    }
});

/**
 * Activation hook
 */
register_activation_hook(__FILE__, 'mebl_configurator_activate');
function mebl_configurator_activate() {
    // Check WordPress version
    if (version_compare(get_bloginfo('version'), '6.0', '<')) {
        wp_die('This plugin requires WordPress 6.0 or higher.');
    }
    
    // Check PHP version
    if (version_compare(PHP_VERSION, '8.0', '<')) {
        wp_die('This plugin requires PHP 8.0 or higher.');
    }
}

/**
 * Add settings link on plugins page
 */
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'mebl_configurator_add_action_links');
function mebl_configurator_add_action_links($links) {
    $settings_link = '<a href="' . admin_url('edit.php?post_type=product') . '">Configure Products</a>';
    array_unshift($links, $settings_link);
    return $links;
}
