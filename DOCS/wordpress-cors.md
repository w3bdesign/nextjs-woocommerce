# WordPress GraphQL CORS setup

The storefront sends credentialed requests to a different origin. The WordPress
GraphQL endpoint must explicitly allow the storefront origin; a wildcard is not
valid for credentialed requests. This cannot be fixed by Next.js response headers.

## Install on WordPress

1. Check whether a plugin, web server, or CDN already manages GraphQL CORS.
   If so, choose one implementation and remove conflicting rules. No existing
   CORS plugin is required to use this solution.
2. Identify the trusted frontend origins for this deployment as described below.
3. Upload [the must-use plugin](../wordpress/mu-plugins/headless-graphql-cors.php)
   to the WordPress server at
   `wp-content/mu-plugins/headless-graphql-cors.php`. Create the directory if needed.
   Place the file directly inside it; WordPress does not auto-load nested folders.
4. Must-use plugins load automatically. Verify it appears under Plugins → Must-Use.
5. Open **Settings → GraphQL CORS** and save the allowed storefront origins.
6. Clear any reverse-proxy/CDN cache. Avoid caching personalized GraphQL responses.
7. Reload the storefront and inspect both preflight and actual GraphQL responses.

## Configure each deployment

The plugin contains no deployment-specific URLs. Configure it through
**Settings → GraphQL CORS** in WordPress admin; no server configuration file edits
are required. Only administrators with permission to manage site settings can
save the allowlist. Enter one exact frontend origin per line.

For the current production storefront, add **https://next-woocommerce.dfweb.no**.
Only if this backend should also accept local development requests, add
**http://localhost:3000** (or the actual development port). Do not add the WordPress
backend URL: the allowlist identifies the frontend sites calling it.

Use exact origins, including scheme and port when needed, without paths or
trailing slashes. Multiple origins can be listed if the same backend intentionally
serves several storefronts. Invalid entries are rejected without replacing the
previously saved list. Empty configuration produces an admin warning and grants
no cross-origin access.

### Optional deployment override

For installations managed through server configuration, the existing constant
remains supported. If defined before WordPress loads, it overrides the admin
setting and makes the form read-only:

```php
define( 'HEADLESS_GRAPHQL_ALLOWED_ORIGINS', [
    'https://shop.example.com',
] );
```

Replace the sample origin with the actual frontend origin for that deployment.

For local development, explicitly add `http://localhost:3000` to the development
backend's configuration only if needed. Do not automatically trust local origins
or staging deployments on production backends. Do not reflect arbitrary origins,
allow every subdomain, or replace the allowlist with a wildcard.

Without an override, the plugin uses the allowlist saved in WordPress admin.
An invalid override type fails closed rather than falling back to the saved list.
Each WordPress deployment must configure its own allowlist; setting a Next.js
environment variable does not configure the WordPress server.

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
