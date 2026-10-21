<?php
/**
 * Plugin Name: Headless GraphQL CORS
 * Description: Allow credentialed GraphQL requests from the storefront only.
 */

defined( 'ABSPATH' ) || exit;

/** Return deployment overrides, or the origins saved in WordPress admin. */
function headlessGraphqlCorsAllowedOrigins(): array {
    $origins = defined( 'HEADLESS_GRAPHQL_ALLOWED_ORIGINS' )
        ? HEADLESS_GRAPHQL_ALLOWED_ORIGINS
        : get_option( 'headless_graphql_cors_allowed_origins', [] );

    return is_array( $origins ) ? $origins : [];
}

/** Check exact HTTP(S) origin syntax and the parsed port range. */
function headlessGraphqlCorsIsValidOrigin( string $origin, $parts ): bool {
    return preg_match( '#\Ahttps?://(?:[a-z\d](?:[a-z\d.-]*[a-z\d])?|\[[\da-f:]+\])(?::\d{1,5})?\z#', $origin )
        && false !== $parts
        && ( ! isset( $parts['port'] ) || ( $parts['port'] >= 1 && $parts['port'] <= 65535 ) );
}

/** Browsers omit default ports from the Origin header. */
function headlessGraphqlCorsNormalizeOrigin( string $origin, array $parts ): string {
    if ( isset( $parts['port'] ) && ( ( 'https' === $parts['scheme'] && 443 === $parts['port'] ) || ( 'http' === $parts['scheme'] && 80 === $parts['port'] ) ) ) {
        return $parts['scheme'] . '://' . $parts['host'];
    }

    return $origin;
}

/** Reject malformed entries without replacing the previously saved allowlist. */
function headlessGraphqlCorsSanitizeOrigins( $input ): array {
    $previous = get_option( 'headless_graphql_cors_allowed_origins', [] );
    $previous = is_array( $previous ) ? $previous : [];

    // A deployment override is authoritative; do not accept misleading edits.
    if ( defined( 'HEADLESS_GRAPHQL_ALLOWED_ORIGINS' ) ) {
        return $previous;
    }

    // WordPress can sanitize twice when creating an option for the first time.
    $lines = is_string( $input ) ? preg_split( '/\r\n|\r|\n/', $input ) : $input;
    if ( ! is_array( $lines ) ) {
        add_settings_error( 'headless_graphql_cors_allowed_origins', 'invalid_origins', 'Enter one HTTP or HTTPS origin per line.' );
        return $previous;
    }

    return headlessGraphqlCorsSanitizeOriginLines( $lines, $previous );
}

/** Validate every line before replacing the saved allowlist. */
function headlessGraphqlCorsSanitizeOriginLines( array $lines, array $previous ): array {
    $origins = [];
    foreach ( $lines as $line ) {
        if ( ! is_string( $line ) ) {
            add_settings_error( 'headless_graphql_cors_allowed_origins', 'invalid_origins', 'Enter one HTTP or HTTPS origin per line.' );
            return $previous;
        }
        $origin = strtolower( trim( $line ) );
        if ( '' === $origin ) {
            continue;
        }

        $parts = wp_parse_url( $origin );
        if ( ! headlessGraphqlCorsIsValidOrigin( $origin, $parts ) ) {
            add_settings_error(
                'headless_graphql_cors_allowed_origins',
                'invalid_origins',
                'Not saved. Use exact HTTP or HTTPS origins, without paths, trailing slashes, credentials, queries, fragments, or wildcards.'
            );
            return $previous;
        }

        $origins[] = headlessGraphqlCorsNormalizeOrigin( $origin, $parts );
    }

    return array_values( array_unique( $origins ) );
}

add_action(
    'admin_init',
    static function (): void {
        register_setting(
            'headless_graphql_cors',
            'headless_graphql_cors_allowed_origins',
            [
                'type'              => 'array',
                'default'           => [],
                'sanitize_callback' => 'headlessGraphqlCorsSanitizeOrigins',
                'show_in_rest'      => false,
            ]
        );
    }
);

add_action(
    'admin_menu',
    static function (): void {
        add_options_page(
            'GraphQL CORS',
            'GraphQL CORS',
            'manage_options',
            'headless-graphql-cors',
            static function (): void {
                if ( ! current_user_can( 'manage_options' ) ) {
                    return;
                }

                $overridden = defined( 'HEADLESS_GRAPHQL_ALLOWED_ORIGINS' );
                echo '<div class="wrap"><h1>GraphQL CORS</h1>';
                settings_errors( 'headless_graphql_cors_allowed_origins' );
                echo '<p>Allow credentialed GraphQL requests only from storefronts you trust. Enter one exact origin per line.</p>';
                if ( $overridden ) {
                    echo '<p><strong>A deployment configuration override is active. This form is read-only.</strong></p>';
                }
                echo '<form action="options.php" method="post">';
                settings_fields( 'headless_graphql_cors' );
                echo '<p><label for="headless-graphql-cors-origins">Allowed storefront origins</label></p>';
                echo '<textarea id="headless-graphql-cors-origins" name="headless_graphql_cors_allowed_origins" rows="8" cols="70" class="large-text code"' . ( $overridden ? ' disabled' : '' ) . '>';
                echo esc_textarea( implode( "\n", array_filter( headlessGraphqlCorsAllowedOrigins(), 'is_string' ) ) );
                echo '</textarea><p class="description">Example: https://shop.example.com — include the scheme and any non-default port, but no path or trailing slash. An empty list blocks all cross-origin storefront access.</p>';
                if ( ! $overridden ) {
                    submit_button();
                }
                echo '</form></div>';
            }
        );
    }
);

add_action(
    'admin_notices',
    static function (): void {
        if ( ! current_user_can( 'manage_options' ) || ! class_exists( '\WPGraphQL' ) || ! empty( headlessGraphqlCorsAllowedOrigins() ) ) {
            return;
        }

        echo '<div class="notice notice-warning"><p>';
        echo esc_html__( 'Headless GraphQL CORS has no allowed storefront origins. Cross-origin storefront requests will be blocked. Configure Settings → GraphQL CORS.', 'headless-graphql-cors' );
        echo ' <a href="' . esc_url( admin_url( 'options-general.php?page=headless-graphql-cors' ) ) . '">Configure GraphQL CORS</a>';
        echo '</p></div>';
    }
);

// MU plugins load before regular plugins, so defer the dependency check.
add_action(
    'plugins_loaded',
    static function (): void {
        if ( class_exists( '\WPGraphQL' ) ) {
            return;
        }

        add_action(
            'admin_notices',
            static function (): void {
                if ( ! current_user_can( 'manage_options' ) ) {
                    return;
                }

                echo '<div class="notice notice-warning"><p>';
                echo esc_html__(
                    'Headless GraphQL CORS requires WPGraphQL to be installed and active. No GraphQL CORS headers are being configured.',
                    'headless-graphql-cors'
                );
                echo '</p></div>';
            }
        );
    }
);

add_filter(
    'graphql_response_headers_to_send',
    static function ( array $headers ): array {
        // Configure Settings → GraphQL CORS; no origins are trusted by default.
        $allowed_origins = headlessGraphqlCorsAllowedOrigins();
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
