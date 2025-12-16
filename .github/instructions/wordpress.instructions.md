# WordPress Bridge Plugins — Copilot Instructions (Project-Specific)

## Project Context

- WordPress + WooCommerce act as the **admin panel and product database only**
- WordPress is **hosted and managed externally (home.pl)** and **is NOT part of this repository**
- This repository contains:
  - **Custom WordPress plugins (PHP)** acting as a **GraphQL bridge/API layer**
  - **Next.js + React 18 frontend**
  - **Three.js–based 3D furniture configurator**
  - **Apollo Client / GraphQL integration**
- WordPress plugins in this repo **do not render UI** and **do not control themes**
- Plugins expose **data, configuration, and product metadata** via **WPGraphQL/WooGraphQL**
- All APIs are **GraphQL-only** — no REST endpoints are registered

WordPress must be treated as a **headless GraphQL backend**, and this repository as a **fullstack integration layer**.

---

## 1. Architectural Principles

- WordPress is a **headless GraphQL data source**, not a rendering layer
- Plugins:
  - Expose **GraphQL types and fields** via WPGraphQL
  - Validate, normalize, and authorize data
  - Never output HTML intended for end users
- All **UI, rendering, and interaction logic lives in Next.js / React / Three.js**
- WooCommerce is used strictly for:
  - Products
  - Base prices
  - Variations
  - Orders
- Custom plugin code must assume **external consumption by Apollo Client in Next.js**

---

## 2. WordPress Plugin Scope

### Required WordPress Plugins

This project requires the following WordPress plugins to be installed and activated:

**Core Dependencies:**

- **WooCommerce** (10.3.5+) — Product management, cart, and orders
- **WPGraphQL** (2.5.3+) — GraphQL API for WordPress
- **WPGraphQL for WooCommerce (WooGraphQL)** (0.21.2+) — Adds WooCommerce to GraphQL schema
- **WPGraphQL JWT Authentication** — JWT-based authentication for GraphQL mutations
- **WPGraphQL CORS** (2.1+) — CORS header management for GraphQL requests

**Custom Plugins (in this repository):**

- **MEBL 3D Configurator Bridge** (1.0.0) — Connects WooCommerce products to 3D configurator models via GraphQL
- **Mebl Configurator Order Meta** (0.1.0) — Persists 3D configurator extraData from cart items into order meta

### Plugins MAY

- Register GraphQL types and fields via WPGraphQL
- Read WooCommerce product data
- Store and retrieve configurator metadata in post meta
- Persist cart extraData into order item meta
- Validate permissions and nonces in admin context
- Act as a stable contract between WordPress and Next.js

### Plugins MUST NOT

- Define themes or templates
- Render frontend HTML
- Enqueue frontend JS/CSS for public pages
- Register REST API endpoints (use GraphQL exclusively)
- Depend on WordPress page lifecycle for UX
- Assume WordPress controls routing or navigation

---

## 3. PHP Coding Rules (Bridge Layer)

- Use **PHP namespaces** (recommended but not mandatory)
- If not using namespaces, prefix class names with plugin identifier (e.g., `MEBL_`, `Mebl_`)
- Treat each plugin as a **bounded context**
- Keep files small and responsibility-focused
- Prefer **static classes or singletons** for simple bridge logic
- No business logic in the plugin root file beyond bootstrapping

### Plugin Entry File Pattern

**Option 1: Procedural Hook (Simple Plugins)**

```php
<?php
defined('ABSPATH') || exit;

/**
 * Plugin Name: MEBL 3D Configurator Bridge
 * Description: Headless API bridge between WooCommerce and Next.js 3D configurator.
 * Version: 1.0.0
 * Text Domain: mebl-configurator-bridge
 * Requires: WooCommerce
 */

require_once plugin_dir_path(__FILE__) . 'includes/class-meta-fields.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-graphql-extension.php';

add_action('plugins_loaded', 'mebl_configurator_init');

function mebl_configurator_init() {
    MEBL_Configurator_Meta_Fields::init();
    MEBL_Configurator_GraphQL::init();
}
```

**Option 2: Singleton Pattern (State Management)**

```php
<?php
defined('ABSPATH') || exit;

/**
 * Plugin Name: Mebl Configurator Order Meta
 * Description: Persist 3D configurator extraData from cart items.
 * Version: 0.1.0
 */

require_once plugin_dir_path(__FILE__) . 'includes/class-order-meta.php';

add_action('plugins_loaded', function() {
    Mebl_Configurator_Order_Meta::instance();
});
```

---

## 4. Data Exposure Rules

- **Never expose raw WooCommerce objects**
- Always map data into **explicit DTO-like arrays**
- GraphQL responses must be:
  - Versioned (via field deprecation)
  - Predictable
  - Frontend-friendly

### Correct

```php
return [
  'id' => $product->get_id(),
  'sku' => $product->get_sku(),
  'basePrice' => (float) $product->get_price(),
  'configurable' => true,
];
```

### Incorrect

```php
return $product;
```

---

## 5. GraphQL API Standards

- This project uses **WPGraphQL exclusively** — no REST endpoints are registered
- All data exposure is via **GraphQL schema extensions**
- GraphQL queries are consumed by **Apollo Client in Next.js**

### Registering GraphQL Types

```php
// Register a custom GraphQL object type
add_action('graphql_register_types', function() {
  register_graphql_object_type('ProductConfigurator', [
    'description' => '3D configurator metadata for products',
    'fields' => [
      'enabled' => [
        'type' => 'Boolean',
        'description' => 'Whether configurator is enabled for this product'
      ],
      'familyId' => [
        'type' => 'String',
        'description' => 'Model family identifier for configurator'
      ],
      'modelId' => [
        'type' => 'String',
        'description' => 'Legacy field for backward compatibility',
        'deprecationReason' => 'Use familyId instead'
      ]
    ]
  ]);
});
```

### Adding Fields to Existing Types

```php
// Extend WooCommerce product types with configurator data
add_action('graphql_register_types', function() {
  $product_types = ['SimpleProduct', 'VariableProduct'];

  foreach ($product_types as $type) {
    register_graphql_field($type, 'configurator', [
      'type' => 'ProductConfigurator',
      'description' => '3D configurator settings',
      'resolve' => function($product) {
        $product_id = $product->databaseId;
        $enabled = get_post_meta($product_id, '_configurator_enabled', true) === '1';

        if (!$enabled) {
          return null; // GraphQL best practice: null for missing/disabled
        }

        $family_id = get_post_meta($product_id, '_configurator_family_id', true);

        return [
          'enabled' => true,
          'familyId' => $family_id,
          'modelId' => $family_id // Backward compatibility
        ];
      }
    ]);
  }
});
```

### GraphQL Versioning Strategy

- Use **field deprecation** for backward-compatible changes:
  ```php
  'deprecationReason' => 'Use familyId instead'
  ```
- Deprecated fields remain queryable but signal migration path to clients
- For breaking changes, add new types/fields alongside old ones before removing
- Test all schema changes via GraphiQL at `/graphql` endpoint

### Security in GraphQL Resolvers

- GraphQL queries are **publicly accessible by default**
- Mutations require authentication (handled by WPGraphQL JWT Authentication plugin)
- Validate data access in resolver functions:
  ```php
  'resolve' => function($product) {
    // Check if current user can view this product
    if (!current_user_can('read_product', $product->databaseId)) {
      return null;
    }
    // Return data...
  }
  ```

---

## 6. Security & Trust Boundaries

- Treat the frontend as **untrusted**
- Validate:
  - Product IDs
  - Configuration payloads
- Never trust client-side data without server-side validation

---

## 7. Registry Synchronization (Critical)

WordPress plugin and Next.js frontend must maintain synchronized model family registries. Mismatches will cause "Configuration Unavailable" errors.

### WordPress Plugin Registry

**Location:** `wordpress/mebl-configurator-bridge/includes/class-meta-fields.php`

```php
class MEBL_Configurator_Meta_Fields {
    private static $available_families = [
        'cabinet-family-01' => 'Cabinet Series A',
        'dresser-family-01' => 'Dresser Series A'
    ];
}
```

### Next.js Frontend Registry

**Location:** `src/config/families.registry.ts`

```typescript
import { CABINET_FAMILY } from './families/cabinet-family-01';
import { DRESSER_FAMILY } from './families/dresser-family-01';

export const FAMILY_REGISTRY: Record<string, ModelFamily> = {
  'cabinet-family-01': CABINET_FAMILY,
  'dresser-family-01': DRESSER_FAMILY,
};
```

### Deployment Checklist

When adding or removing model families:

1. ✅ Update WordPress plugin `$available_families` array
2. ✅ Update Next.js `FAMILY_REGISTRY` with family definition
3. ✅ Deploy both WordPress plugin and Next.js app simultaneously
4. ✅ Test product configurator loads without errors
5. ✅ Verify GraphQL query returns `familyId` matching registry keys

**Failure Mode:** If `familyId` exists in WordPress but not in `FAMILY_REGISTRY`, the configurator will display "Configuration Unavailable" error to users.

---

## 8. Order Meta Persistence

Cart configuration data (`extraData`) must be persisted to WooCommerce order item meta for fulfillment teams.

### Hook Pattern

**Location:** `wordpress/mebl-configurator-order-meta/includes/class-order-meta.php`

```php
class Mebl_Configurator_Order_Meta {
    public function __construct() {
        add_action(
            'woocommerce_checkout_create_order_line_item',
            [$this, 'copy_cart_meta_to_order_item'],
            10,
            4
        );
    }

    public function copy_cart_meta_to_order_item($order_item, $cart_item_key, $values, $order) {
        if (!isset($values['extraData'])) {
            return;
        }

        $extra_data = $values['extraData'];
        $payload = json_decode($extra_data, true);

        // Store full JSON snapshot
        $order_item->add_meta_data('_mebl_configurator', wp_json_encode($payload), true);

        // Store atomic queryable fields
        if (isset($payload['familyId'])) {
            $order_item->add_meta_data('_mebl_configurator_familyId', $payload['familyId'], true);
        }
        if (isset($payload['activeVariantId'])) {
            $order_item->add_meta_data('_mebl_configurator_activeVariantId', $payload['activeVariantId'], true);
        }
    }
}
```

### Data Structure

**Atomic Fields (queryable):**

- `_mebl_configurator_familyId` — Model family identifier
- `_mebl_configurator_activeVariantId` — Selected variant

**Full Snapshot (display):**

- `_mebl_configurator` — Complete JSON payload including dimensions, colors, materials

This dual storage allows:

1. **Database queries** by family/variant (reporting, inventory)
2. **Admin display** of full configuration details (order fulfillment)

---

## 9. JavaScript / TypeScript Rules

- JS/TS files are **not WordPress scripts**
- They belong to:
  - Next.js
  - React
  - Three.js
  - Apollo
- Do **not** use `@wordpress/*` packages unless explicitly requested
- Assume modern standards:
  - ES2022+
  - React 18
  - Strict TypeScript

Copilot must **never generate Gutenberg or block editor code** unless explicitly instructed.

---

## 10. 3D Configurator Integrationn

- WordPress plugins provide:
  - Configuration schemas
  - Asset references (IDs, URLs, metadata)
- Plugins do NOT:
  - Load GLTF/GLB files
  - Handle Three.js scenes
  - Perform rendering or animation

The frontend owns:

- Scene graph
- Variant switching
- Dimension scaling
- Material swapping

---

## 11. Performance Expectationss

- Optimize for:
  - High read frequency
  - Stateless API calls
- Use:
  - Object cache / transients for expensive queries
- Avoid:
  - N+1 queries
  - Repeated WooCommerce object instantiation

---

## 12. Testing Philosophy

- Focus on:
  - API correctness
  - Data integrity
  - Security boundaries
- Tests should validate:
  - Input sanitization
  - Permission logic
- UI/E2E testing belongs exclusively to the Next.js app

---

## 13. Copilot Hard Constraints

Copilot must ensure:

- No frontend rendering inside WordPress plugins
- No assumptions about WordPress routing or themes
- Explicit API contracts between PHP and JS
- Clear separation:
  - **WordPress = data + rules**
  - **Next.js = UI + interaction**
- All plugin code is deployable independently of the frontend
- GraphQL-only API exposure (no REST endpoints)
