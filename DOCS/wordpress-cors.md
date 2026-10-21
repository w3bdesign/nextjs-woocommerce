# WordPress GraphQL CORS setup

The storefront sends credentialed requests to a different origin. The WordPress
GraphQL endpoint must explicitly allow the storefront origin; a wildcard is not
valid for credentialed requests. This cannot be fixed by Next.js response headers.

## Install on WordPress

1. Check whether a plugin, web server, or CDN already manages GraphQL CORS.
   If so, choose one implementation and remove conflicting rules. No existing
   CORS plugin is required to use this solution.
2. Configure the allowed storefront origins for this deployment as described below.
3. Upload [the must-use plugin](../wordpress/mu-plugins/headless-graphql-cors.php)
   to the WordPress server at
   `wp-content/mu-plugins/headless-graphql-cors.php`. Create the directory if needed.
   Place the file directly inside it; WordPress does not auto-load nested folders.
4. Must-use plugins load automatically. Verify it appears under Plugins → Must-Use.
5. Clear any reverse-proxy/CDN cache. Avoid caching personalized GraphQL responses.
6. Reload the storefront and inspect both preflight and actual GraphQL responses.

## Configure each deployment

The plugin contains no deployment-specific URLs. In the WordPress server's
`wp-config.php`, before WordPress is loaded, define the allowed storefront origins:

```php
define( 'HEADLESS_GRAPHQL_ALLOWED_ORIGINS', [
    'https://shop.example.com',
] );
```

Replace the sample origin with the actual frontend origin for that customer and
environment. Use an array of exact origins, including scheme and port when needed,
without paths or trailing slashes. Multiple origins can be listed if the same
backend intentionally serves several storefronts.

For local development, explicitly add `http://localhost:3000` to the development
backend's configuration only if needed. Do not automatically trust local origins
or staging deployments on production backends. Do not reflect arbitrary origins,
allow every subdomain, or replace the allowlist with a wildcard.

If the constant is missing or is not an array, the plugin trusts no cross-origin
clients. Each WordPress deployment must configure its own allowlist; setting a
Next.js environment variable does not configure the WordPress server.

## Verify

In browser developer tools, inspect the GraphQL network requests. Both the
preflight and actual responses for the storefront must include:

```text
Access-Control-Allow-Origin: https://shop.example.com
Access-Control-Allow-Credentials: true
```

The preflight must allow the POST method and the Content-Type and
woocommerce-session request headers. The actual response must expose the
woocommerce-session response header so Apollo can read the session token.

There must be only one Access-Control-Allow-Origin response header. If a wildcard
remains, inspect nginx, the CDN, caching rules, or another plugin: an upstream
header cannot be removed by changing WPGraphQL's header array alone.

Keep credentials enabled in the frontend: authentication relies on cookies.
CORS is not authentication or CSRF protection. Existing login, authorization, and
CSRF protections must remain in place. If login still fails after CORS succeeds,
inspect cookie domain/path/security settings separately. Different origins may be
same-site or cross-site depending on their domains and schemes. Cross-site cookies
have additional browser restrictions; do not change SameSite blindly.

## Why this hook

WPGraphQL's response-header filter runs for both OPTIONS preflight and regular
GraphQL responses. The plugin uses this supported hook rather than modifying
WPGraphQL core or sending unrelated CORS headers across all WordPress routes.

The plugin is a deployment artifact in this frontend repository. Merely deploying
the Next.js application does not install it on WordPress.
