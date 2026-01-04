<?php
/**
 * Plugin Name: MEBL Review Bridge
 * Plugin URI: https://github.com/szpeqq/mebl
 * Description: Headless API bridge for product reviews. Stores reviews in WordPress comments, calculates aggregates, exposes via GraphQL.
 * Version: 1.0.0
 * Author: MEBL Team
 * Author URI: https://yoursite.com
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * Requires Plugins: woocommerce
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: mebl-review-bridge
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
define('MEBL_REVIEW_VERSION', '1.0.0');
define('MEBL_REVIEW_PATH', plugin_dir_path(__FILE__));
define('MEBL_REVIEW_URL', plugin_dir_url(__FILE__));

/**
 * Check if required plugins are active
 */
function mebl_review_check_dependencies() {
    $missing_plugins = [];
    
    // Check WooCommerce (hard requirement)
    if (!class_exists('WooCommerce')) {
        $missing_plugins[] = '<a href="' . admin_url('plugin-install.php?s=woocommerce&tab=search&type=term') . '">WooCommerce</a>';
        error_log('MEBL Review Bridge: WooCommerce is not installed or activated. Plugin functionality disabled.');
    }
    
    // Check WPGraphQL (soft requirement - show notice only)
    if (!class_exists('WPGraphQL')) {
        add_action('admin_notices', 'mebl_review_graphql_notice');
        error_log('MEBL Review Bridge: WPGraphQL is not installed. GraphQL features (Phase 3+) will not be available.');
    }
    
    // Show error and deactivate if WooCommerce is missing
    if (!empty($missing_plugins)) {
        add_action('admin_notices', function() use ($missing_plugins) {
            ?>
            <div class="notice notice-error">
                <p><strong>MEBL Review Bridge</strong> requires the following plugins to be installed and activated:</p>
                <ul style="list-style: disc; padding-left: 20px;">
                    <?php foreach ($missing_plugins as $plugin): ?>
                        <li><?php echo wp_kses_post($plugin); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <?php
        });
        
        // Deactivate plugin
        deactivate_plugins(plugin_basename(__FILE__));
        
        return false;
    }
    
    return true;
}

/**
 * Notice for missing WPGraphQL (soft dependency)
 */
function mebl_review_graphql_notice() {
    ?>
    <div class="notice notice-warning">
        <p><strong>MEBL Review Bridge</strong> works best with <a href="<?php echo admin_url('plugin-install.php?s=wpgraphql&tab=search&type=term'); ?>">WPGraphQL</a> installed. GraphQL API features will be available in Phase 3.</p>
    </div>
    <?php
}

/**
 * Plugin activation hook
 */
function mebl_review_activate() {
    // Check dependencies before activation
    if (!mebl_review_check_dependencies()) {
        error_log('MEBL Review Bridge: Plugin activation failed due to missing dependencies.');
        return;
    }
    
    error_log('MEBL Review Bridge: Plugin activation started.');
    
    // Create database indexes (implemented in TODO 3)
    mebl_review_create_indexes();
    
    // Flush rewrite rules
    flush_rewrite_rules();
    
    error_log('MEBL Review Bridge: Plugin activation completed successfully.');
}
register_activation_hook(__FILE__, 'mebl_review_activate');

/**
 * Plugin deactivation hook
 */
function mebl_review_deactivate() {
    error_log('MEBL Review Bridge: Plugin deactivation started.');
    
    // Flush rewrite rules
    flush_rewrite_rules();
    
    // Note: We do NOT drop indexes on deactivation
    // This preserves data integrity if plugin is reactivated
    
    error_log('MEBL Review Bridge: Plugin deactivation completed. Indexes and data preserved.');
}
register_deactivation_hook(__FILE__, 'mebl_review_deactivate');

/**
 * Create database indexes for review queries
 * Called during plugin activation
 */
function mebl_review_create_indexes() {
    global $wpdb;
    
    $table_name = $wpdb->comments;
    $charset_collate = $wpdb->get_charset_collate();
    
    // Index 1: Product review lookup (most common query)
    // Optimizes: WHERE comment_post_ID = X AND comment_approved = '1' AND comment_type = 'review' ORDER BY comment_date DESC
    $index_1 = "CREATE INDEX idx_product_reviews 
                 ON {$table_name}(comment_post_ID, comment_approved, comment_date)";
    
    // Index 2: User review history
    // Optimizes: WHERE user_id = X AND comment_type = 'review' ORDER BY comment_date DESC
    $index_2 = "CREATE INDEX idx_user_reviews 
                 ON {$table_name}(user_id, comment_approved, comment_date)";
    
    // Index 3: Moderation queue
    // Optimizes: WHERE comment_approved = '0' AND comment_type = 'review' ORDER BY comment_date DESC
    $index_3 = "CREATE INDEX idx_moderation_queue 
                 ON {$table_name}(comment_approved, comment_type, comment_date)";
    
    // Check if indexes already exist and create them
    $indexes = [
        'idx_product_reviews' => $index_1,
        'idx_user_reviews' => $index_2,
        'idx_moderation_queue' => $index_3,
    ];
    
    foreach ($indexes as $index_name => $index_sql) {
        // Check if index exists
        $index_exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) 
             FROM INFORMATION_SCHEMA.STATISTICS 
             WHERE table_schema = %s 
             AND table_name = %s 
             AND index_name = %s",
            DB_NAME,
            $table_name,
            $index_name
        ));
        
        if (!$index_exists) {
            $result = $wpdb->query($index_sql);
            
            if ($result === false) {
                // Log error but continue (graceful degradation)
                error_log(sprintf(
                    'MEBL Review Bridge: Failed to create index %s. Error: %s',
                    $index_name,
                    $wpdb->last_error
                ));
            } else {
                error_log(sprintf(
                    'MEBL Review Bridge: Successfully created index %s',
                    $index_name
                ));
            }
        }
    }
}

/**
 * Initialize plugin
 */
function mebl_review_init() {
    // Check dependencies on every page load
    if (!mebl_review_check_dependencies()) {
        error_log('[MEBL Review Bridge] Initialization skipped due to missing dependencies.');
        return;
    }
    
    error_log('[MEBL Review Bridge] Starting plugin initialization...');
    
    // Require core class files
    $class_files = [
        'class-review-storage.php',
        'class-rating-aggregator.php',
        'class-review-hooks.php',
        'class-review-validation.php',
        'class-review-helpers.php',
        'class-admin-ui.php',
        'class-email-notifications.php',
    ];
    
    foreach ($class_files as $file) {
        $file_path = MEBL_REVIEW_PATH . 'includes/' . $file;
        if (!file_exists($file_path)) {
            error_log(sprintf(
                '[MEBL Review Bridge] CRITICAL: Required file missing: %s',
                $file_path
            ));
            return;
        }
        require_once $file_path;
    }
    
    // Verify classes exist after loading
    $required_classes = [
        'MEBL_Review_Storage', 
        'MEBL_Rating_Aggregator', 
        'MEBL_Review_Hooks', 
        'MEBL_Review_Validation', 
        'MEBL_Review_Helpers',
        'MEBL_Review_Admin_UI',
        'MEBL_Email_Notifications',
    ];
    foreach ($required_classes as $class) {
        if (!class_exists($class)) {
            error_log(sprintf(
                '[MEBL Review Bridge] CRITICAL: Required class not found: %s',
                $class
            ));
            return;
        }
    }
    
    error_log('[MEBL Review Bridge] ✓ Core classes loaded');
    
    // Initialize hooks
    MEBL_Review_Hooks::init();
    error_log('[MEBL Review Bridge] ✓ WordPress hooks initialized');
    
    // Initialize admin UI (Phase 6)
    if (is_admin()) {
        MEBL_Review_Admin_UI::init();
        error_log('[MEBL Review Bridge] ✓ Admin UI initialized');
    }
    
    // Initialize email notifications (Phase 6)
    MEBL_Email_Notifications::init();
    error_log('[MEBL Review Bridge] ✓ Email notifications initialized');
    
    // Load GraphQL extension if WPGraphQL is available (Phase 3)
    if (class_exists('WPGraphQL')) {
        $graphql_file = MEBL_REVIEW_PATH . 'includes/class-graphql-reviews.php';
        if (file_exists($graphql_file)) {
            require_once $graphql_file;
            
            if (class_exists('MEBL_Review_GraphQL')) {
                MEBL_Review_GraphQL::init();
                error_log('[MEBL Review Bridge] ✓ GraphQL extension loaded and initialized');
            } else {
                error_log('[MEBL Review Bridge] ERROR: MEBL_Review_GraphQL class not found after loading file');
            }
        } else {
            error_log('[MEBL Review Bridge] ERROR: GraphQL file not found at ' . $graphql_file);
        }
        
        // Load GraphQL schema extensions for rating/verified fields
        $graphql_schema_file = MEBL_REVIEW_PATH . 'includes/class-graphql-schema.php';
        if (file_exists($graphql_schema_file)) {
            require_once $graphql_schema_file;
            
            if (class_exists('MEBL\\ReviewBridge\\GraphQL_Schema')) {
                new \MEBL\ReviewBridge\GraphQL_Schema();
                error_log('[MEBL Review Bridge] ✓ GraphQL schema extensions loaded (rating/verified fields)');
            } else {
                error_log('[MEBL Review Bridge] ERROR: GraphQL_Schema class not found after loading file');
            }
        }
    } else {
        error_log('[MEBL Review Bridge] WPGraphQL not active - GraphQL API disabled');
    }
    
    error_log('[MEBL Review Bridge] ✓ Plugin initialization complete');
}
add_action('plugins_loaded', 'mebl_review_init');
