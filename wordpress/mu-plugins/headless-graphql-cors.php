<?php
/**
 * Plugin Name: Headless GraphQL CORS
 * Description: Allow credentialed GraphQL requests from the storefront only.
 */

defined( 'ABSPATH' ) || exit;

add_filter(
    'graphql_response_headers_to_send',
    static function ( array $headers ): array {
        // Configure each deployment in wp-config.php; no origins are trusted by default.
        // Example: define( 'HEADLESS_GRAPHQL_ALLOWED_ORIGINS', [ 'https://shop.example.com' ] );
        $allowed_origins = defined( 'HEADLESS_GRAPHQL_ALLOWED_ORIGINS' )
            ? HEADLESS_GRAPHQL_ALLOWED_ORIGINS
            : [];

        // Fail closed if deployment configuration has the wrong type.
        if ( ! is_array( $allowed_origins ) ) {
            $allowed_origins = [];
        }

        $origin = get_http_origin();

        // Replace WPGraphQL's wildcard, rather than adding a second origin header.
        unset( $headers['Access-Control-Allow-Origin'], $headers['Access-Control-Allow-Credentials'] );

        // Preserve WPGraphQL's existing cache variation (e.g. X-GraphQL-Preview).
        $headers['Vary'] = empty( $headers['Vary'] ) ? 'Origin' : $headers['Vary'] . ', Origin';

        if ( ! in_array( $origin, $allowed_origins, true ) ) {
            return $headers;
        }

        $headers['Access-Control-Allow-Origin']      = $origin;
        $headers['Access-Control-Allow-Credentials'] = 'true';
        $headers['Access-Control-Allow-Methods']     = 'GET, POST, OPTIONS';

        // Keep headers registered by WPGraphQL/extensions and add storefront needs.
        $allowed_headers = array_map( 'trim', explode( ',', $headers['Access-Control-Allow-Headers'] ?? '' ) );
        $headers['Access-Control-Allow-Headers'] = implode(
            ', ',
            array_unique( array_filter( array_merge( $allowed_headers, [ 'Content-Type', 'Authorization', 'woocommerce-session', 'X-WP-Nonce' ] ) ) )
        );

        $exposed_headers = array_map( 'trim', explode( ',', $headers['Access-Control-Expose-Headers'] ?? '' ) );
        $headers['Access-Control-Expose-Headers'] = implode(
            ', ',
            array_unique( array_filter( array_merge( $exposed_headers, [ 'woocommerce-session' ] ) ) )
        );

        return $headers;
    },
    1000
);
