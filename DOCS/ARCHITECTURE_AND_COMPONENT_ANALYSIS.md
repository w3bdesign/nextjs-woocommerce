# Architecture & Component Analysis for AI Agents

> **Purpose**: This document provides essential architectural knowledge and component reuse analysis for AI agents working in this codebase. It focuses on the "big picture" understanding that requires reading multiple files and identifies opportunities for code consolidation.

---

## Table of Contents

1. [Big Picture Architecture](#big-picture-architecture)
2. [Critical Developer Workflows](#critical-developer-workflows)
3. [Route & Component Analysis](#route--component-analysis)
4. [Component Reuse Opportunities](#component-reuse-opportunities)
5. [State Management Patterns](#state-management-patterns)
6. [Integration Points & Data Flow](#integration-points--data-flow)
7. [Project-Specific Conventions](#project-specific-conventions)
8. [Actionable Refactoring Recommendations](#actionable-refactoring-recommendations)

---

## Big Picture Architecture

### System Overview

**Architecture Pattern**: Headless E-commerce (JAMstack)
- **Frontend**: Next.js 15 (Pages Router, **not** App Router)
- **Backend**: WordPress + WooCommerce + WPGraphQL
- **State Management**: Zustand (cart) + Valtio (3D configurator)
- **Data Layer**: Apollo Client with custom session middleware
- **UI Framework**: Shadcn/UI (Radix UI + Tailwind CSS)
- **3D Rendering**: Three.js + React Three Fiber + Drei

### Why This Architecture?

1. **Headless CMS Separation**: WordPress backend can be managed independently, frontend can be deployed to static/edge hosting
2. **GraphQL Over REST**: Single endpoint, precise data fetching, reduces over-fetching
3. **Session-Based Cart**: WooCommerce sessions stored in localStorage with 7-day expiry enable guest checkout without authentication
4. **Configuration-Driven 3D**: Model registry pattern allows adding new 3D products without code changes
5. **Component-Driven UI**: Shadcn/UI provides customizable primitives without vendor lock-in

---

## Critical Developer Workflows

### Essential Commands

```bash
# Development
npm run dev                  # Start dev server with Turbopack (fast refresh)
npm run build               # Production build
npm run start               # Production server

# Testing
npm run playwright          # Run all E2E tests
npm run playwright:ui       # Interactive test UI (recommended for debugging)
npm run playwright:debug    # Debug mode with step-through

# Code Quality
npm run lint               # ESLint check
npm run format             # Prettier formatting
npm run refresh            # Nuclear option: clean install + format

# Performance Monitoring
npm run lhci              # Lighthouse CI (performance metrics)
npm run lhci:perf         # Performance-focused audit
npm run lhci:desktop      # Desktop-specific audit
```

### Mock Data Mode (Development Without Backend)

Set `NEXT_PUBLIC_ENABLE_MOCKS=true` in `.env.local` to use mock data:
- Defined in `src/utils/apollo/mockData.ts`
- Intercepted by `mockLink` in Apollo Client
- Useful for frontend development, testing, and CI/CD

### Build & Test Strategy

1. **Local Development**: Use mocks or point to staging WooCommerce instance
2. **E2E Tests**: Run against mocked data (fast, deterministic)
3. **Staging**: Test against real WooCommerce data
4. **Production**: Performance monitoring with Lighthouse CI in GitHub Actions

---

## Route & Component Analysis

### Route Structure Overview

| Route | Purpose | Key Components | Data Fetching |
|-------|---------|----------------|---------------|
| `/` (index.tsx) | Homepage | `Hero`, `DisplayProducts` | SSG - All products |
| `/products` | Product grid with filters | `ProductList`, `ProductFilters` | SSG - All products |
| `/categories` | Category listing | `CategoriesComponent` | SSG - All categories |
| `/category/[slug]` | Products by category | `DisplayProducts`, Breadcrumb | SSR - Category products |
| `/product/[slug]` | Single product detail | `SingleProduct`, `ProductConfigurator` | SSR - Single product |
| `/cart` | Shopping cart | `CartContents` | Client-side (Zustand) |
| `/checkout` | Checkout form | `CheckoutForm`, Breadcrumb | Client-side |
| `/login` | User authentication | `UserLogin` | Client-side |
| `/my-account` | Customer dashboard | `CustomerAccount` (with HOC) | Client-side (protected) |

### Common Pattern: Layout Wrapper

**Every page** uses the same pattern:
```tsx
<Layout title="Page Title">
  {/* page content */}
</Layout>
```

The `Layout` component (`src/components/Layout/Layout.component.tsx`) provides:
- Consistent header/footer
- Page title injection
- Skip-to-content accessibility link
- Sticky navigation
- Conditional container (`Home` page gets special treatment)

---

## Component Reuse Opportunities

### 🔴 CRITICAL: Duplicate Product Display Components

**Problem**: Two nearly identical components for displaying product grids:

1. **`DisplayProducts.component.tsx`** (202 lines)
   - Used in: `/`, `/category/[slug]`
   - Renders products with inline mapping logic
   - Price formatting inline
   - Manual UUID key generation

2. **`ProductList.component.tsx`** (93 lines)
   - Used in: `/products`
   - Uses `ProductCard` child component
   - Includes filtering UI and sort dropdown
   - Better separation of concerns

**Root Cause**: These evolved separately. `DisplayProducts` is legacy, `ProductList` is the modern approach.

#### Consolidation Strategy

**Recommended**: Retire `DisplayProducts`, migrate to `ProductCard` everywhere

```tsx
// Target: Single unified component
<ProductGrid 
  products={products}
  showFilters={true}      // Optional filters sidebar
  showSorting={true}      // Optional sort dropdown
  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}  // Responsive grid
/>
```

**Benefits**:
- **DRY**: Single source of truth for product display logic
- **KISS**: Simpler mental model (one way to show products)
- **SOLID**: Single Responsibility (ProductCard handles single product, ProductGrid handles layout)

### 🟡 MODERATE: Breadcrumb Duplication

**Used in**: `/checkout`, `/category/[slug]`, `/product/[slug]`

Each page manually constructs breadcrumbs:
```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href="/">Home</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    {/* ... manual hierarchy ... */}
  </BreadcrumbList>
</Breadcrumb>
```

#### Consolidation Strategy

**Recommended**: Create `BreadcrumbNav` component with path auto-generation:

```tsx
// Target: Declarative breadcrumbs
<BreadcrumbNav 
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: productName } // Current page (no href)
  ]}
/>
```

**Benefits**:
- **DRY**: Breadcrumb structure defined once
- **YAGNI**: Remove unused breadcrumb variants
- Easy to extend with structured data (SEO)

### 🟡 MODERATE: Price Formatting Logic

**Current State**: Price formatting scattered across components:

1. **`functions.tsx`**: `paddedPrice()`, `filteredVariantPrice()`
2. **`Price.component.tsx`**: `<Price>`, `<PriceGroup>`
3. **Multiple components**: Direct price manipulation

**Example of duplication**:
```tsx
// In DisplayProducts.component.tsx
if (price) {
  price = paddedPrice(price, 'kr');
}
if (regularPrice) {
  regularPrice = paddedPrice(regularPrice, 'kr');
}
// ... repeated in ProductCard, SingleProduct
```

#### Consolidation Strategy

**Recommended**: Centralize all price logic in `Price.component.tsx`:

```tsx
// Smart component that handles all formatting internally
<Price 
  value={product.price}
  currency="kr"
  onSale={product.onSale}
  salePrice={product.salePrice}
  regularPrice={product.regularPrice}
/>
```

**Benefits**:
- **SOLID**: Single Responsibility for price display
- **DRY**: Remove duplicate `paddedPrice()` calls
- Easier to add i18n currency support later

### 🟢 LOW: Container/Wrapper Components

**Good Example**: `Layout.component.tsx` already provides excellent reuse
- Used consistently across all 9 routes
- Single responsibility (page structure)
- Minimal prop API (`title`, `children`)

**Minor Opportunity**: `Container.component` (used in `SingleProduct`)
- Could be promoted to more pages for consistent max-width/padding
- Currently only used once (YAGNI violation?)

---

## State Management Patterns

### Zustand (Cart State)

**Location**: `src/stores/cartStore.ts`

**Purpose**: Global shopping cart with localStorage persistence

**Key Methods**:
```tsx
const { cart, updateCart, clearWooCommerceSession } = useCartStore();
```

**Persistence Strategy**:
1. Zustand middleware persists to `localStorage['cart-store']`
2. WooCommerce session token in `localStorage['woo-session']` (7-day TTL)
3. Dual sync with `localStorage['woocommerce-cart']`

**Critical Behavior**: 
- Session expires after 7 days (checked in Apollo middleware)
- Cart syncs on every `updateCart()` call
- `CartInitializer` component hydrates cart on app mount

### Valtio (3D Configurator State)

**Location**: `src/stores/configuratorStore.ts`

**Purpose**: Real-time 3D model customization (colors, interactive parts)

**Usage Pattern**:
```tsx
import { useSnapshot } from 'valtio';
import { configuratorState } from '@/stores/configuratorStore';

const snap = useSnapshot(configuratorState);
// React re-renders when snap.items or snap.interactiveStates change
```

**Key Features**:
- Proxy-based reactivity (no hooks needed for mutations)
- `initializeConfigurator(modelConfig)` sets up initial state from config
- `toggleInteractivePart()` for animations (e.g., cabinet doors)

**Design Decision**: Valtio chosen for 3D state because:
- Simpler syntax for nested object mutations (vs Zustand)
- Better integration with Three.js event handlers (direct mutations)
- No need for persistence (3D state resets on page reload)

---

## Integration Points & Data Flow

### 1. Apollo Client Session Management

**Location**: `src/utils/apollo/ApolloClient.js`

**Critical Middleware Flow**:

```
Request → Middleware (adds session header) → GraphQL → Afterware (stores session) → Response
```

**Middleware** (`middleware` ApolloLink):
1. Checks `localStorage['woo-session']` for token + timestamp
2. If token > 7 days old → delete session, clear cart
3. If valid → attach `woocommerce-session: Session <token>` header

**Afterware** (`afterware` ApolloLink):
1. Reads `woocommerce-session` response header
2. If new session → store in localStorage with `createdTime`
3. If `"false"` → delete session (cart cleared on backend)

**Why This Matters**:
- Enables guest checkout (no user account required)
- Session persistence across page reloads
- Automatic session cleanup prevents stale carts

### 2. GraphQL Query Patterns

**Location**: `src/utils/gql/GQL_QUERIES.ts`

**Key Queries**:
- `FETCH_ALL_PRODUCTS_QUERY` - Homepage and `/products` (SSG)
- `GET_SINGLE_PRODUCT` - Product detail page (SSR)
- `GET_PRODUCTS_FROM_CATEGORY` - Category pages (SSR)
- `GET_CART` - Cart contents (client-side)

**Query Strategy**:
- **SSG** (Static Site Generation): Use for data that changes infrequently
  - Homepage products, categories list
  - Revalidate: 60 seconds (ISR)
- **SSR** (Server-Side Rendering): Use for dynamic data
  - Single product (supports legacy URL redirects)
  - Category products (varies by slug)
- **Client-Side**: Use for user-specific data
  - Cart contents, user profile, checkout

### 3. WooCommerce GraphQL Schema Extensions

**Custom Fields** (defined in WPGraphQL WooCommerce):
- `product.configurator.enabled` - Enables 3D configurator
- `product.configurator.modelId` - Model registry key (e.g., "cabinet-v1")
- `product.allPaColors.nodes` - Custom taxonomy for product colors
- `product.allPaSizes.nodes` - Custom taxonomy for sizes

**Why This Matters**: These fields drive dynamic UI features (filters, 3D models) without hardcoding product attributes.

### 4. 3D Model Registry Pattern

**Location**: `src/config/models.registry.ts`

**Pattern**:
```tsx
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'shoe-v1': SHOE_CONFIG,
  'cabinet-v1': CABINET_CONFIG,
  // Add new models here (no component changes needed)
};
```

**Usage**:
```tsx
// In product page
{product.configurator?.enabled && (
  <ProductConfigurator modelId={product.configurator.modelId} />
)}
```

**Configuration** (`ModelConfig` interface):
```tsx
{
  modelPath: '/shoe-draco.glb',
  parts: [
    { nodeName: 'shoe_sole', materialName: 'sole', defaultColor: '#ffffff' }
  ],
  interactiveParts: [
    { nodeName: 'door_left', animation: 'rotate-y', defaultState: false }
  ],
  camera: { position: [0, 0, 5], fov: 50 }
}
```

**Benefits**:
- **SOLID**: Open/Closed Principle (open for extension, closed for modification)
- **DRY**: Configuration drives rendering (no per-model components)
- **YAGNI**: Only add config fields when needed (e.g., animations added later)

---

## Project-Specific Conventions

### 1. File Naming

**Pattern**: `ComponentName.component.tsx` (not just `ComponentName.tsx`)

**Rationale**: Explicit suffix disambiguates components from types/utils
- `Product.component.tsx` vs `product.ts` (types)
- Searchability: grep for "*.component.tsx"

**Exception**: `ui/` folder uses standard naming (Shadcn convention)

### 2. Component Structure

**Standard Pattern**:
```tsx
// Imports (grouped by external → internal → types → styles)
import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { TypographyH1 } from '@/components/UI/Typography.component';

import type { Product } from '@/types/product';

// Component
const MyComponent = ({ prop }: Props) => {
  // Logic
  
  return (
    // JSX
  );
};

export default MyComponent;
```

### 3. Typography Components

**Location**: `src/components/UI/Typography.component.tsx`

**Usage**: **Always** use Typography components (never raw `<h1>`, `<p>` tags)
```tsx
import { TypographyH1, TypographyP } from '@/components/UI/Typography.component';

<TypographyH1>Product Name</TypographyH1>
<TypographyP>Description text</TypographyP>
```

**Benefits**:
- Consistent styling (defined in one place)
- Semantic HTML with custom styling
- `as` prop for semantic override: `<TypographyH2 as="h1">`

### 4. Styling Approach

**Pattern**: Tailwind utility classes + `cn()` helper
```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  {
    'conditional-class': someCondition,
    'another-class': otherCondition
  },
  className // Allow prop override
)}>
```

**Never**: Inline styles (use Tailwind classes)
**Rarely**: Custom CSS (only for complex animations)

### 5. SSG vs SSR Decision Matrix

| Data Characteristic | Strategy | Revalidate |
|---------------------|----------|------------|
| Static, rarely changes | SSG | 60s+ |
| Dynamic, varies by slug | SSR | N/A |
| User-specific | Client-side | N/A |
| High traffic, low change rate | SSG with ISR | 60-300s |

**Example**: Product pages use **SSR** despite being cacheable because:
1. Legacy URL redirect logic (query param removal)
2. Per-product customization (future feature)
3. Real-time stock status (future feature)

---

## Actionable Refactoring Recommendations

### Priority 1: Consolidate Product Display Components

**Impact**: High (removes ~150 lines of duplicate code)
**Effort**: Medium (2-3 hours)

**Steps**:
1. Create `ProductGrid.component.tsx` based on `ProductList`
2. Extract grid layout to accept `columns` prop
3. Make filters/sorting optional via props
4. Migrate `/` and `/category/[slug]` to use `ProductGrid`
5. Delete `DisplayProducts.component.tsx`
6. Update tests

**Files to modify**:
- `src/pages/index.tsx`
- `src/pages/category/[slug].tsx`
- `src/components/Product/ProductGrid.component.tsx` (new)
- Delete: `src/components/Product/DisplayProducts.component.tsx`

### Priority 2: Extract Breadcrumb Component

**Impact**: Medium (improves maintainability, enables SEO enhancement)
**Effort**: Low (1 hour)

**Steps**:
1. Create `BreadcrumbNav.component.tsx`
2. Accept `items: Array<{ label: string; href?: string }>` prop
3. Migrate 3 pages to use new component
4. (Future) Add structured data for SEO

**Files to modify**:
- `src/components/Layout/BreadcrumbNav.component.tsx` (new)
- `src/pages/checkout.tsx`
- `src/pages/category/[slug].tsx`
- `src/pages/product/[slug].tsx`

### Priority 3: Centralize Price Formatting

**Impact**: Medium (DRY principle, easier i18n)
**Effort**: Low (1-2 hours)

**Steps**:
1. Extend `Price.component.tsx` to handle raw values + currency
2. Remove `paddedPrice()` utility calls from components
3. Standardize on `<PriceGroup>` for all product displays
4. Update tests

**Files to modify**:
- `src/components/UI/Price.component.tsx`
- `src/components/Product/ProductCard.component.tsx`
- `src/components/Product/SingleProduct.component.tsx`
- `src/components/Product/DisplayProducts.component.tsx` (if not deleted)

### Priority 4: Create Page Layout Variants

**Impact**: Low (better abstraction)
**Effort**: Low (1 hour)

**Steps**:
1. Extend `Layout.component.tsx` to support variants:
   - `default` - Current behavior
   - `narrow` - Max-width container for text-heavy pages
   - `full` - Full-width for landing pages
2. Apply to appropriate pages

**Example**:
```tsx
<Layout title="Cart" variant="narrow">
  <CartContents />
</Layout>
```

### Priority 5: Extract Common Loading States

**Impact**: Low (consistency)
**Effort**: Low (30 min)

**Current**: `/products` has skeleton loading, others use text
**Target**: Reusable `ProductGridSkeleton` component

**Files to create**:
- `src/components/Product/ProductGridSkeleton.component.tsx`

---

## Quick Reference: Component Dependency Graph

```
App (_app.tsx)
├── ApolloProvider (session middleware)
├── CartInitializer (hydrates cart on mount)
├── Toaster (global notifications)
└── Pages
    ├── Layout (header, footer, page title)
    │   ├── Header (nav, cart icon, search)
    │   ├── PageTitle (conditional rendering)
    │   └── Footer (links, newsletter, sticky nav)
    │
    └── Page-Specific Components
        ├── DisplayProducts → ProductCard (manual, LEGACY)
        ├── ProductList → ProductCard (modern)
        ├── SingleProduct → AddToCart, ProductConfigurator
        ├── CartContents → CartItem components
        └── CheckoutForm → Billing, Zod validation
```

---

## Testing Strategy

**E2E Tests** (`src/tests/`):
- Focus: Critical user paths (view products, add to cart)
- Run with mocks (fast, deterministic)
- CI/CD integration (GitHub Actions)

**Manual Testing Checklist**:
1. Cart persistence (refresh page, cart remains)
2. Session expiry (mock old timestamp, verify cleanup)
3. 3D configurator (color changes, animations)
4. Responsive layouts (mobile, tablet, desktop)
5. Accessibility (keyboard nav, screen reader)

---

## Future Improvements (from SUGGESTIONS.md)

Ranked by impact vs effort:

1. **Server Components** - Migrate to Next.js 15 App Router (high effort, high impact)
2. **Search Optimization** - Replace Algolia with WooCommerce GraphQL search (medium effort, medium impact)
3. **Image Optimization** - Use Next.js `<Image>` everywhere (low effort, high impact) ✅ Partially done
4. **Type Safety** - Convert `ApolloClient.js` to TypeScript (low effort, medium impact)
5. **Error Boundaries** - Add React error boundaries (low effort, high impact)

---

## Conclusion

This codebase demonstrates **good architectural decisions**:
- Clean separation of concerns (pages, components, state, data)
- Configuration-driven 3D system (extensible without code changes)
- Consistent UI patterns (Typography, Price components)

**Primary opportunity for improvement**: Component consolidation (DRY principle)
- Two product display components doing the same job
- Manual breadcrumb construction repeated
- Price formatting logic scattered

**Recommended next steps**:
1. Follow Priority 1-3 refactoring recommendations
2. Add missing TypeScript types (especially in utility functions)
3. Consider App Router migration for improved performance (long-term)

This architecture is well-suited for AI agents because:
- Clear conventions (file naming, component patterns)
- Centralized configurations (models registry, GraphQL queries)
- Documentation-first approach (copilot-instructions.md)
- Mock data support (no backend dependency for development)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-21
**Maintained By**: AI Agent Analysis
