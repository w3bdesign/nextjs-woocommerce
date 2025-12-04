<?php
/**
 * Plugin Name: Mebl Configurator Order Meta
 * Description: Persist 3D configurator extraData from cart items into WooCommerce order item meta and display it in the admin order page.
 * Version: 0.1.0
 * Author: Mebl Dev
 * Text Domain: mebl-configurator-order-meta
 */

if (!defined('ABSPATH')) {
    exit;
}

// Only load in WP
define('MEBL_CONF_OM_PATH', plugin_dir_path(__FILE__));
define('MEBL_CONF_OM_URL', plugin_dir_url(__FILE__));

// Require main class
require_once MEBL_CONF_OM_PATH . 'includes/class-order-meta.php';

// Initialize plugin
add_action('plugins_loaded', function () {
    if (class_exists('Mebl_Configurator_Order_Meta')) {
        Mebl_Configurator_Order_Meta::instance();
    }
});
