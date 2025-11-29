# Complete Installation Guide: WordPress Plugin

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Initial Configuration](#initial-configuration)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

### Required Software

Before installing, ensure you have:

- ✅ **WordPress 6.0+** installed
- ✅ **PHP 8.0+** (check via Tools → Site Health)
- ✅ **WooCommerce 7.0+** plugin installed & activated
- ✅ **Admin access** to WordPress dashboard

### Recommended Plugins

For full functionality, install these plugins:

- 🔌 **WPGraphQL** - Enables GraphQL API
- 🔌 **WPGraphQL for WooCommerce** - Exposes WooCommerce data via GraphQL

**Install via WordPress Admin:**

1. Go to **Plugins → Add New**
2. Search for "WPGraphQL"
3. Click **Install Now** → **Activate**
4. Repeat for "WPGraphQL for WooCommerce"

---

## Installation Methods

### Method 1: Upload ZIP via WordPress Admin (Recommended)

#### Step 1: Create ZIP File

On your computer, navigate to the plugin directory:

```bash
cd /path/to/mebl/wordpress
zip -r mebl-configurator-bridge.zip mebl-configurator-bridge/
```

**Or on Windows:**

- Right-click `mebl-configurator-bridge` folder
- Select "Compress to ZIP file"
- Name it `mebl-configurator-bridge.zip`

#### Step 2: Upload to WordPress

1. **Log in to WordPress Admin**
   - Go to your WordPress site
   - Navigate to: `https://your-site.com/wp-admin`

2. **Access Plugin Upload**
   - Click **Plugins** in left sidebar
   - Click **Add New** at top
   - Click **Upload Plugin** button

3. **Upload File**
   - Click **Choose File**
   - Select `mebl-configurator-bridge.zip`
   - Click **Install Now**
   - Wait for upload to complete (should take 2-5 seconds)

4. **Activate Plugin**
   - Click **Activate Plugin** button
   - You should see: "Plugin activated successfully"

#### Step 3: Verify Installation

Go to **Plugins → Installed Plugins**

You should see:

```
✅ MEBL 3D Configurator Bridge
   Connects WooCommerce products to 3D configurator models
   Version 1.0.0 | By MEBL Team
   Configure Products | Deactivate | Edit
```

---

### Method 2: FTP/SFTP Upload

#### Step 1: Connect to Server

Use an FTP client (FileZilla, Cyberduck, WinSCP):

- **Host:** your-site.com
- **Username:** your-ftp-username
- **Password:** your-ftp-password
- **Port:** 21 (FTP) or 22 (SFTP)

#### Step 2: Upload Plugin Folder

1. Navigate to: `/wp-content/plugins/`
2. Upload the entire folder: `mebl-configurator-bridge/`
3. Ensure all files are uploaded:
   ```
   mebl-configurator-bridge/
   ├── mebl-configurator-bridge.php
   ├── includes/
   │   ├── class-meta-fields.php
   │   └── class-graphql-extension.php
   └── readme.txt
   ```

#### Step 3: Activate in WordPress

1. Go to WordPress Admin → **Plugins**
2. Find "MEBL 3D Configurator Bridge"
3. Click **Activate**

---

### Method 3: Command Line (SSH)

If you have SSH access:

```bash
# Connect to server
ssh username@your-server.com

# Navigate to plugins directory
cd /var/www/html/wp-content/plugins/

# Create plugin directory
mkdir mebl-configurator-bridge
cd mebl-configurator-bridge

# Create main file
nano mebl-configurator-bridge.php
# Paste content from the PHP file, save (Ctrl+X, Y, Enter)

# Create includes directory
mkdir includes
cd includes

# Create class files
nano class-meta-fields.php
# Paste content, save

nano class-graphql-extension.php
# Paste content, save

# Set correct permissions
cd /var/www/html/wp-content/plugins/
chmod -R 755 mebl-configurator-bridge/
chown -R www-data:www-data mebl-configurator-bridge/
```

Then activate via WordPress Admin.

---

## Initial Configuration

### Step 1: Check Dependency Status

After activation, check for warning messages:

#### If you see: ⚠️ "WPGraphQL is recommended"

**Action:** Install WPGraphQL for full functionality

1. Go to **Plugins → Add New**
2. Search: "WPGraphQL"
3. Install both:
   - WPGraphQL
   - WPGraphQL for WooCommerce
4. Activate both plugins

#### If you see: ❌ "WooCommerce must be installed"

**Action:** Install WooCommerce

1. Go to **Plugins → Add New**
2. Search: "WooCommerce"
3. Click **Install Now** → **Activate**
4. Complete WooCommerce setup wizard

### Step 2: Configure Your First Product

#### A. Edit an Existing Product

1. Go to **Products → All Products**
2. Click **Edit** on any product

#### B. Or Create a New Product

1. Go to **Products → Add New**
2. Enter product details (name, price, description)
3. Click **Publish**

#### C. Find Configurator Settings

Scroll down the right sidebar. You should see:

```
┌─────────────────────────────────────┐
│ 🎨 3D Configurator Settings        │
├─────────────────────────────────────┤
│ ☐ Enable 3D Configurator           │
│ When enabled, customers will see an │
│ interactive 3D model instead of a   │
│ static product image.               │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ Select 3D Model:                    │
│ [— Choose a model —          ▼]    │
│                                     │
│ This ID must match exactly with     │
│ your Next.js MODEL_REGISTRY.        │
│                                     │
│ 💡 Quick Start:                     │
│ 1. Check "Enable 3D Configurator"   │
│ 2. Select a 3D model               │
│ 3. Click "Update" to save          │
│ 4. View product on website         │
└─────────────────────────────────────┘
```

**If you don't see this box:**

- Click **Screen Options** (top right corner)
- Ensure "3D Configurator Settings" is checked
- Refresh page (Ctrl+F5 / Cmd+Shift+R)

#### D. Enable Configurator

1. **Check the box:** ☑ Enable 3D Configurator
2. **Select a model** from dropdown:
   - 🗄️ Bar Cabinet (v1)
   - 🪑 Bedroom Dresser (v1)
3. **Click "Update"** button (top right)

#### E. Verify Success

After clicking Update, you should see:

```
✅ Configurator is active! Model: 🗄️ Bar Cabinet (v1)
```

---

## Testing

### Test 1: WordPress Admin Check

#### Verify Plugin is Active

Go to **Plugins → Installed Plugins**

Look for:

- ✅ Green "Active" text under plugin name
- "Configure Products" link
- No error messages

#### Check Products List

Go to **Products → All Products**

You should see a new column: **"🎨 3D Model"**

| Product Name   | 🎨 3D Model           | Price |
| -------------- | --------------------- | ----- |
| Modern Cabinet | ✓ 🗄️ Bar Cabinet (v1) | $999  |
| Simple Chair   | —                     | $299  |

Products with configurators show a checkmark, others show a dash.

---

### Test 2: GraphQL API Check

#### Access GraphiQL IDE

1. Go to **GraphQL** in WordPress sidebar
2. Click **GraphiQL IDE**

If you don't see this menu:

- WPGraphQL is not installed
- Install it: **Plugins → Add New → Search "WPGraphQL"**

#### Run Test Query

Paste this query in the left panel:

```graphql
query TestConfigurator {
  products(first: 10) {
    nodes {
      id
      databaseId
      name
      slug
      configurator {
        enabled
        modelId
      }
    }
  }
}
```

Click the **Play** button (▶).

#### Expected Response

Right panel should show:

```json
{
  "data": {
    "products": {
      "nodes": [
        {
          "id": "cHJvZHVjdDoxMjM=",
          "databaseId": 123,
          "name": "Modern Oak Cabinet",
          "slug": "modern-oak-cabinet",
          "configurator": {
            "enabled": true,
            "modelId": "cabinet-v1"
          }
        },
        {
          "id": "cHJvZHVjdDoxMjQ=",
          "databaseId": 124,
          "name": "Simple Wooden Chair",
          "slug": "simple-wooden-chair",
          "configurator": null
        }
      ]
    }
  }
}
```

**Notes:**

- Products with configurator enabled show `{"enabled": true, "modelId": "..."}` ✅
- Products without configurator show `null` ✅ (this is correct!)

#### If Response is Empty

```json
{
  "data": {
    "products": {
      "nodes": []
    }
  }
}
```

**Solutions:**

1. Create at least one WooCommerce product
2. Make sure products are published (not drafts)
3. Try query with slug instead:

```graphql
query SingleProduct {
  product(id: "modern-oak-cabinet", idType: SLUG) {
    name
    configurator {
      enabled
      modelId
    }
  }
}
```

---

### Test 3: Frontend Integration

#### Test from Next.js App

If your Next.js app is running on `localhost:3000`:

```typescript
// Test in browser console or component
fetch('https://wordpress2533583.home.pl/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query {
        product(id: "modern-oak-cabinet", idType: SLUG) {
          name
          configurator {
            enabled
            modelId
          }
        }
      }
    `,
  }),
})
  .then((r) => r.json())
  .then((data) => console.log(data));
```

Expected output:

```json
{
  "data": {
    "product": {
      "name": "Modern Oak Cabinet",
      "configurator": {
        "enabled": true,
        "modelId": "cabinet-v1"
      }
    }
  }
}
```

#### Test on Product Page

1. Navigate to your Next.js site: `http://localhost:3000`
2. Go to a product page: `/product/modern-oak-cabinet`
3. **Expected:** 3D configurator appears instead of static image
4. **Check browser console** for errors

---

## Troubleshooting

### Issue 1: Plugin Won't Activate

#### Symptoms

- Error message on activation
- Plugin immediately deactivates
- White screen of death

#### Solutions

**A. Check PHP Version**

Go to **Tools → Site Health → Info → Server**

Look for: `PHP Version: 8.0.x` or higher

If lower than 8.0:

- Contact your hosting provider to upgrade PHP
- Or edit plugin file and change requirement (not recommended):
  ```php
  // Line 106 in mebl-configurator-bridge.php
  if (version_compare(PHP_VERSION, '7.4', '<')) { // Changed from 8.0
  ```

**B. Check WooCommerce**

1. Go to **Plugins → Installed Plugins**
2. Ensure WooCommerce is active
3. If not, activate WooCommerce first
4. Then activate MEBL plugin

**C. Check Error Logs**

Enable WordPress debug mode:

1. Edit `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   ```
2. Check `/wp-content/debug.log` for errors
3. Search for "MEBL" in the log

---

### Issue 2: Meta Box Not Showing

#### Symptoms

- Edit product screen doesn't show "3D Configurator Settings"
- Right sidebar is empty

#### Solutions

**A. Check Screen Options**

1. Click **Screen Options** (top right corner of product edit screen)
2. Scroll down to "Boxes" section
3. Ensure **"3D Configurator Settings"** checkbox is checked
4. Close Screen Options panel

**B. Clear Browser Cache**

- Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Or open in incognito/private window

**C. Check User Permissions**

- Make sure you're logged in as Administrator
- Shop Managers also have access
- Editors and lower roles cannot see product meta boxes

---

### Issue 3: GraphQL Returns Null

#### Symptoms

```json
{
  "data": {
    "product": {
      "configurator": null
    }
  }
}
```

#### Solutions

**A. Verify Product Settings**

1. Edit the product in WordPress
2. Check that "Enable 3D Configurator" is checked
3. Check that a model is selected in dropdown
4. Click **Update** to save
5. Try GraphQL query again

**B. Clear GraphQL Schema Cache**

1. Go to **GraphQL → Settings**
2. Click **"Clear Schema Cache"** button
3. Save settings
4. Try query again

**C. Re-save Product**

Sometimes WordPress needs a "kick":

1. Edit the product
2. Don't change anything
3. Just click **Update**
4. Try query again

**D. Check WPGraphQL Version**

1. Go to **Plugins → Installed Plugins**
2. Find "WPGraphQL"
3. Ensure version is 1.13.0 or higher
4. If outdated, click **Update Now**

---

### Issue 4: Dropdown Shows "Choose a model" Only

#### Symptoms

- Dropdown only has one option: "— Choose a model —"
- No actual models listed

#### Cause

The `$available_models` array is empty or plugin file is corrupted.

#### Solutions

**A. Verify Plugin Files**

1. Go to **Plugins → Plugin File Editor**
2. Select "MEBL 3D Configurator Bridge"
3. Select file: `includes/class-meta-fields.php`
4. Find line ~30: `private static $available_models = [`
5. Verify it contains:
   ```php
   'cabinet-v1' => '🗄️ Bar Cabinet (v1)',
   'dresser-v1' => '🪑 Bedroom Dresser (v1)',
   ```

**B. Re-upload Plugin**

1. Deactivate plugin
2. Delete plugin via WordPress admin
3. Re-upload fresh copy
4. Activate again

---

### Issue 5: Frontend Doesn't Show Configurator

#### Symptoms

- GraphQL returns correct data
- WordPress meta box works
- But Next.js site shows static image instead

#### Solutions

**A. Check Environment Variable**

In Next.js `.env.local`:

```env
NEXT_PUBLIC_ENABLE_MOCKS=false
NEXT_PUBLIC_GRAPHQL_URL=https://wordpress2533583.home.pl/graphql
```

**B. Verify GraphQL Query**

In `src/utils/gql/GQL_QUERIES.ts`, ensure query includes:

```typescript
export const GET_SINGLE_PRODUCT = gql`
  query Product($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      # ... other fields
      configurator {
        enabled
        modelId
      }
    }
  }
`;
```

**C. Check Component Logic**

In `src/components/Product/SingleProduct.component.tsx`:

```tsx
{
  product.configurator?.enabled ? (
    <ProductConfigurator
      modelId={product.configurator.modelId}
      product={product}
    />
  ) : (
    <img src={product.image?.sourceUrl} alt={name} />
  );
}
```

**D. Check Browser Console**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors related to configurator
4. Common issues:
   - "Model configuration not found" → modelId mismatch
   - "Cannot read property 'modelId'" → configurator field missing
   - CORS errors → Need to configure WPGraphQL CORS settings

---

## Advanced Configuration

### Adding Custom Models

When you create new 3D models in Next.js, update the WordPress plugin:

#### Option 1: Via WordPress Admin

1. Go to **Plugins → Plugin File Editor**
2. Select "MEBL 3D Configurator Bridge"
3. Select file: `includes/class-meta-fields.php`
4. Find line ~30:
   ```php
   private static $available_models = [
       'cabinet-v1' => '🗄️ Bar Cabinet (v1)',
       'dresser-v1' => '🪑 Bedroom Dresser (v1)',
       // ADD NEW MODELS HERE:
   ];
   ```
5. Add your model:
   ```php
   'sofa-modern-v1' => '🛋️ Modern Sofa',
   ```
6. Click **Update File**

#### Option 2: Via FTP/SFTP

1. Download `includes/class-meta-fields.php`
2. Edit locally
3. Add model to array
4. Upload back to server
5. Overwrite existing file

#### Model ID Rules

✅ **DO:**

- Use lowercase
- Use hyphens for spaces
- Include version number
- Match exactly with Next.js registry

❌ **DON'T:**

- Use spaces
- Use special characters (except hyphens)
- Use uppercase
- Use different IDs in WordPress vs Next.js

**Example:**

```typescript
// Next.js: src/config/models.registry.ts
'sofa-modern-v1': SOFA_CONFIG,

// WordPress: includes/class-meta-fields.php
'sofa-modern-v1' => '🛋️ Modern Sofa',
```

---

### Extending the Plugin

#### Adding Custom Fields

To add more configurator options (like pricing rules):

1. **Add Database Field:**

   ```php
   // In class-meta-fields.php, render_meta_box() method
   $pricing = get_post_meta($post->ID, '_configurator_pricing', true);
   ?>
   <textarea name="mebl_configurator_pricing"><?php echo esc_textarea($pricing); ?></textarea>
   ```

2. **Save Field:**

   ```php
   // In save_meta_fields() method
   if (isset($_POST['mebl_configurator_pricing'])) {
       $pricing = sanitize_textarea_field($_POST['mebl_configurator_pricing']);
       update_post_meta($post_id, '_configurator_pricing', $pricing);
   }
   ```

3. **Expose via GraphQL:**
   ```php
   // In class-graphql-extension.php, register_types() method
   'customPricing' => [
       'type' => 'String',
       'resolve' => function($product) {
           return get_post_meta($product->databaseId, '_configurator_pricing', true);
       }
   ]
   ```

---

### Security Hardening

#### File Permissions

Set correct permissions via SSH:

```bash
cd /wp-content/plugins/mebl-configurator-bridge/
chmod 644 *.php
chmod 644 includes/*.php
chmod 755 .
```

#### Disable File Editing

In `wp-config.php`, add:

```php
define('DISALLOW_FILE_EDIT', true);
```

This prevents editing plugin files via WordPress admin (more secure).

---

## Post-Installation Checklist

After completing installation:

- [ ] Plugin activated successfully
- [ ] No error messages on Plugins page
- [ ] WooCommerce is installed and active
- [ ] WPGraphQL is installed and active (recommended)
- [ ] At least one product configured with a model
- [ ] Meta box appears on product edit screen
- [ ] GraphQL query returns configurator data
- [ ] Products list shows "🎨 3D Model" column
- [ ] Frontend displays 3D configurator correctly
- [ ] No browser console errors
- [ ] Tested on mobile and desktop

---

## Getting Help

### WordPress Error Log

Enable debug mode in `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check `/wp-content/debug.log` for errors.

### Browser Console

Press F12 and check:

- Console tab (for JavaScript errors)
- Network tab (for API call failures)
- Application tab → Local Storage (for cached data)

### GraphQL Debugging

In GraphiQL, enable "Debug" mode:

1. Click gear icon (⚙️) in top right
2. Enable "Tracing"
3. Run query
4. Check "Extensions" in response for detailed errors

---

## Deployment to Production

### Pre-Launch Checklist

- [ ] Test on staging site first
- [ ] Backup WordPress database
- [ ] Backup WordPress files
- [ ] Test all product pages
- [ ] Test GraphQL queries
- [ ] Check SSL certificate is active
- [ ] Verify WooCommerce settings
- [ ] Test checkout flow
- [ ] Monitor error logs for 24 hours
- [ ] Have rollback plan ready

### Performance Tips

1. **Enable Object Caching**
   - Install Redis or Memcached
   - Reduces database queries

2. **Use CDN for 3D Models**
   - Upload GLB files to CDN
   - Update model paths in configs

3. **Enable GraphQL Caching**
   - Install WPGraphQL Smart Cache plugin
   - Configure cache TTL

---

**Installation Complete!** 🎉

Your WordPress plugin is now connected to your Next.js 3D configurator. Products with enabled configurators will automatically show the 3D view on your frontend.
