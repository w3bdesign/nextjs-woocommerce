# WordPress CORS Configuration Fix

## Issue

The WordPress GraphQL endpoint is currently returning `Access-Control-Allow-Origin: *` (wildcard), which conflicts with Apollo Client's `credentials: 'include'` setting. Browsers block this combination for security reasons.

**Error in Console:**

```
Access to fetch at 'https://wordpress2533583.home.pl/graphql' from origin 'http://localhost:3000'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*'
when the request's credentials mode is 'include'.
```

## Why This Happens

- **Frontend**: Apollo Client uses `credentials: 'include'` to send WooCommerce session cookies
- **Backend**: WordPress is configured to allow all origins (`*`) for CORS
- **Browser Security**: Wildcard CORS is not allowed when credentials are included

## Solution

Configure WordPress to return the specific origin instead of `*`.

### Option 1: Update .htaccess (✅ Works on home.pl)

**According to [home.pl documentation](https://pomoc.home.pl/baza-wiedzy/jak-dodac-autoryzacje-cors-do-naglowkow-na-serwerze-home-pl), CORS headers are supported.**

Add to your WordPress `.htaccess` file (at the **top**, before `# BEGIN WordPress`):

```apache
# CORS Headers for GraphQL API with credentials
Header always set Access-Control-Allow-Origin "http://localhost:3000"
Header always set Access-Control-Allow-Credentials "true"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, woocommerce-session"
Header always set Access-Control-Max-Age "3600"

# Handle preflight OPTIONS requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

⚠️ **Limitation**: This allows only ONE origin. For multiple origins (localhost:3000, 3001, 3002, production), use Option 2 (PHP) instead.

### Option 2: Must-Use Plugin (✅ Recommended - Best Solution)

**This method works on all hosting providers, always loads, and survives theme changes.**

#### Quick Installation:

1. **Upload the plugin file**: `wordpress/mu-plugins/mebl-cors-fix.php` (included in this repo)
2. **Location**: Upload to `/wp-content/mu-plugins/` on your WordPress server
3. **Done**: Plugin activates automatically (no activation needed)

The plugin supports:

- ✅ Multiple localhost ports (3000, 3001, 3002)
- ✅ Production domain (mebl.onrender.com)
- ✅ Debug logging (when WP_DEBUG enabled)
- ✅ Proper preflight handling
- ✅ WooCommerce session headers

**OR** add to your theme's `functions.php`:

```php
<?php
/**
 * Fix CORS for GraphQL with credentials
 */
add_action('init', function() {
    $allowed_origins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://mebl.onrender.com'
    ];

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, woocommerce-session');
        header('Access-Control-Max-Age: 3600');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit;
    }
});
```

### Option 3: WPGraphQL CORS Settings

If you have a CORS plugin (like "WP GraphQL CORS"), configure it to:

1. **Enable CORS**: Yes
2. **Allowed Origins**:
   - `http://localhost:3000` (development)
   - `https://mebl.onrender.com` (production)
3. **Allow Credentials**: Yes (MUST be enabled)
4. **Allowed Methods**: GET, POST, OPTIONS
5. **Allowed Headers**: Content-Type, Authorization, woocommerce-session

## Testing

After applying the fix:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart development server: `npm run dev:api`
3. Check console - CORS error should be gone
4. Verify products load from WordPress API

## Production Deployment

**Important:** Update allowed origins to include your production domain:

```apache
# Production .htaccess
SetEnvIf Origin "^https://mebl\.onrender\.com$" ORIGIN_MATCH=$0
```

Or in PHP:

```php
$allowed_origins = [
    'https://mebl.onrender.com'
];
```

## Current Configuration Status

- ✅ Frontend Apollo Client: Configured correctly with `credentials: 'include'`
- ❌ Backend WordPress: Returns wildcard `*` (needs fix)
- ✅ WPGraphQL: Installed and working
- ✅ WooCommerce Session: Working via cookies

## Alternative: Temporary Development Workaround

If you can't modify WordPress config immediately, use mocks for development:

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MOCKS='true'

# Then run
npm run dev
```

This bypasses the WordPress API and uses local mock data. Switch back with `npm run dev:api` when CORS is fixed.

## Verification

Run this in browser console after fix:

```javascript
fetch('https://wordpress2533583.home.pl/graphql', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ products { nodes { name } } }' }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

Should return product data without CORS errors.
