# WordPress Plugin: MEBL 3D Configurator Bridge

This directory contains the WordPress plugin that connects WooCommerce products to your Next.js 3D configurator.

## 📁 Directory Structure

```
wordpress/
├── mebl-configurator-bridge/          # Plugin folder (upload this to WordPress)
│   ├── mebl-configurator-bridge.php   # Main plugin file
│   ├── includes/
│   │   ├── class-meta-fields.php      # Product meta box & fields
│   │   └── class-graphql-extension.php # WPGraphQL schema
│   └── readme.txt                      # WordPress.org plugin readme
├── README.md                           # This file
└── INSTALLATION.md                     # Complete installation guide
```

## 🚀 Quick Start

### Prerequisites

Before installing this plugin, ensure your WordPress site has:

- ✅ **WordPress 6.0+**
- ✅ **PHP 8.0+**
- ✅ **WooCommerce 7.0+** (required)
- ✅ **WPGraphQL** (recommended)
- ✅ **WPGraphQL for WooCommerce** (recommended)

### Installation Methods

#### Method 1: Upload via WordPress Admin (Easiest)

1. **Create a ZIP file:**

   ```bash
   cd wordpress
   zip -r mebl-configurator-bridge.zip mebl-configurator-bridge/
   ```

2. **Upload to WordPress:**
   - Go to: **Plugins → Add New → Upload Plugin**
   - Choose the ZIP file
   - Click **Install Now** → **Activate**

#### Method 2: FTP/SFTP Upload

1. **Upload folder:**
   - Upload `mebl-configurator-bridge/` to `/wp-content/plugins/`

2. **Activate:**
   - Go to: **Plugins → Installed Plugins**
   - Find "MEBL 3D Configurator Bridge"
   - Click **Activate**

## 📋 How It Works

### 1. WordPress Admin Side

When you edit a WooCommerce product, you'll see a new meta box:

```
┌─────────────────────────────────────┐
│ 🎨 3D Configurator Settings        │
├─────────────────────────────────────┤
│ ☑ Enable 3D Configurator           │
│                                     │
│ Select 3D Model:                    │
│ [🗄️ Bar Cabinet (v1)        ▼]    │
│                                     │
│ ✅ Configurator is active!          │
└─────────────────────────────────────┘
```

### 2. GraphQL API

The plugin exposes configurator data via WPGraphQL:

```graphql
query {
  product(id: "modern-cabinet", idType: SLUG) {
    name
    configurator {
      enabled
      modelId
    }
  }
}
```

Response:

```json
{
  "configurator": {
    "enabled": true,
    "modelId": "cabinet-v1"
  }
}
```

### 3. Next.js Frontend

Your Next.js app automatically receives this data and shows the 3D configurator:

```typescript
// SingleProduct.component.tsx
{product.configurator?.enabled ? (
  <ProductConfigurator modelId={product.configurator.modelId} />
) : (
  <img src={product.image?.sourceUrl} />
)}
```

## 🔧 Adding New 3D Models

When you create a new 3D model in your Next.js app, follow these steps:

### Step 1: Add to Next.js (First)

```typescript
// src/config/sofaModel.config.ts
export const SOFA_CONFIG: ModelConfig = {
  id: 'sofa-modern-v1',
  name: 'Modern Sofa',
  modelPath: '/sofa.glb',
  // ... rest of config
};

// src/config/models.registry.ts
export const MODEL_REGISTRY = {
  'cabinet-v1': CABINET_CONFIG,
  'dresser-v1': DRESSER_CONFIG,
  'sofa-modern-v1': SOFA_CONFIG, // ← ADD THIS
};
```

### Step 2: Update WordPress Plugin (Second)

Edit `includes/class-meta-fields.php`:

```php
private static $available_models = [
    'cabinet-v1' => '🗄️ Bar Cabinet (v1)',
    'dresser-v1' => '🪑 Bedroom Dresser (v1)',
    'sofa-modern-v1' => '🛋️ Modern Sofa', // ← ADD THIS LINE
];
```

**Two ways to update:**

**Option A: Via WordPress Admin**

1. Go to: **Plugins → Plugin File Editor**
2. Select: "MEBL 3D Configurator Bridge"
3. Edit: `includes/class-meta-fields.php`
4. Find line ~30 and add your model
5. Click **Update File**

**Option B: Via FTP/SFTP**

1. Download the file
2. Edit locally
3. Upload back to server

That's it! The new model will appear in the dropdown.

## 🧪 Testing the Plugin

### Test 1: Check Plugin Activation

1. Go to: **Plugins → Installed Plugins**
2. Verify "MEBL 3D Configurator Bridge" is active
3. Check for any error messages

### Test 2: Configure a Product

1. Go to: **Products → All Products**
2. Edit any product
3. Enable configurator and select a model
4. Click **Update**
5. Verify success message appears

### Test 3: GraphQL Query

Go to: **GraphQL → GraphiQL IDE**

```graphql
query TestConfigurator {
  products(first: 5) {
    nodes {
      name
      configurator {
        enabled
        modelId
      }
    }
  }
}
```

Expected: Products with configurator enabled show data, others show `null`

### Test 4: Frontend Display

1. Open your Next.js site
2. Navigate to a product with configurator enabled
3. Verify 3D configurator appears
4. Check browser console for errors

## 📊 Products List Column

The plugin adds a "🎨 3D Model" column to your products list:

| Product Name         | 🎨 3D Model           | Price |
| -------------------- | --------------------- | ----- |
| Modern Oak Cabinet   | ✓ 🗄️ Bar Cabinet (v1) | $999  |
| Classic Wooden Chair | —                     | $299  |

This helps you quickly see which products have configurators enabled.

## 🔒 Security Features

The plugin includes:

- ✅ WordPress nonce verification (prevents CSRF)
- ✅ Input sanitization (`sanitize_text_field`)
- ✅ Permission checks (`current_user_can`)
- ✅ Model ID validation (only allows predefined values)
- ✅ No SQL injection vulnerabilities (uses WordPress APIs)

## 🐛 Troubleshooting

### Plugin doesn't appear after activation

**Solution:**

- Check if WooCommerce is installed and activated
- View error log: **Tools → Site Health → Info → WordPress**
- Try deactivating and reactivating

### Meta box not showing

**Solution:**

- Click **"Screen Options"** (top right on product edit screen)
- Ensure "3D Configurator Settings" is checked
- Refresh the page (Ctrl+F5)

### GraphQL returns null

**Solution:**

1. Verify WPGraphQL is activated
2. Go to: **GraphQL → Settings** → Clear schema cache
3. Re-save the product
4. Try query again

### Model doesn't appear in dropdown

**Solution:**

- Check that model ID is added to `$available_models` array
- Verify spelling matches exactly with Next.js registry
- Clear WordPress cache if using caching plugin

## 📝 File Descriptions

### `mebl-configurator-bridge.php`

Main plugin file. Handles:

- Plugin initialization
- Dependency checks
- Class loading
- Activation hooks

### `includes/class-meta-fields.php`

Product meta box handler. Features:

- Model dropdown selector
- Enable/disable checkbox
- Validation and saving
- Admin UI styling
- Products list column

### `includes/class-graphql-extension.php`

WPGraphQL schema extension. Provides:

- `ProductConfigurator` GraphQL type
- Field resolver
- Support for all product types

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Plugin uploaded and activated
- [ ] WooCommerce configured with products
- [ ] WPGraphQL and WPGraphQL for WooCommerce active
- [ ] At least one product configured with a model
- [ ] GraphQL query tested and returns data
- [ ] Next.js frontend tested with real data
- [ ] Error handling verified
- [ ] SSL certificate active

## 📞 Support

For issues or questions:

1. Check the [INSTALLATION.md](INSTALLATION.md) guide
2. Review WordPress debug log: `/wp-content/debug.log`
3. Enable debug mode in `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

## 📜 License

GPL v2 or later - Same as WordPress

## 🔄 Version History

- **1.0.0** (2025-11-29)
  - Initial release
  - Product meta box with model selector
  - WPGraphQL integration
  - Products list column
  - Full security implementation
