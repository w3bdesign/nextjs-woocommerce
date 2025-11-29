<?php
/**
 * Plugin Name: MEBL CORS Fix for GraphQL
 * Plugin URI: https://mebl.onrender.com
 * Description: Fixes CORS headers for headless Next.js frontend with WooCommerce session credentials. Supports multiple development ports and production domain.
 * Version: 1.0.0
 * Author: MEBL Team
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add CORS headers for GraphQL endpoint
 * Supports multiple origins for development and production
 */
add_action('send_headers', function() {
    // Define allowed origins
    $allowed_origins = [
        // Development - localhost with multiple ports
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        
        // Production - Render.com deployment
        'https://mebl.onrender.com',
        
        // Add more origins here as needed:
        // 'https://staging.mebl.onrender.com',
        // 'https://www.yourdomain.com',
    ];
    
    // Get the origin from the request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Check if the origin is in our allowed list
    if (in_array($origin, $allowed_origins)) {
        // Set CORS headers
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, woocommerce-session, X-WC-Session');
        header('Access-Control-Max-Age: 3600'); // Cache preflight for 1 hour
        
        // Expose WooCommerce session header so frontend can read it
        header('Access-Control-Expose-Headers: woocommerce-session');
    }
    
    // Handle preflight OPTIONS requests
    // Browser sends OPTIONS before actual request to check CORS permissions
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // Return 200 OK status for preflight
        status_header(200);
        exit; // Stop execution after preflight response
    }
}, 1); // Priority 1 to run early

/**
 * Log CORS activity for debugging (only in WP_DEBUG mode)
 */
if (defined('WP_DEBUG') && WP_DEBUG) {
    add_action('init', function() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? 'none';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'none';
        
        error_log("MEBL CORS: Origin={$origin}, Method={$method}");
    });
}
