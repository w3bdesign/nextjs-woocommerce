# Copilot Instructions - Next.js Furniture E-commerce

## Project Overview

Next.js 15 furniture e-commerce with WooCommerce GraphQL backend, 3D product configurator, and Zustand/Valtio state management.

## Architecture

### Data Flow

- **Backend**: WooCommerce + WPGraphQL (headless WordPress)
- **Client**: Apollo Client with session middleware (`src/utils/apollo/ApolloClient.js`)
- **State**: Zustand (cart), Valtio (3D configurator)
- **Rendering**: Next.js Pages Router (not App Router)

### Key Integration Points

1. **Session Management**: WooCommerce sessions stored in `localStorage['woo-session']` with 7-day expiry
2. **Cart Sync**: Dual persistence (Zustand store + `localStorage['woocommerce-cart']`)
3. **Apollo Middleware**: Auto-attaches session headers to GraphQL requests
4. **3D Models**: GLB files in `/public/`, registry at `src/config/models.registry.ts`

## 3D Configurator System

**Configuration-driven architecture** - no component changes needed for new models.

### Adding a New 3D Model (5 minutes)

1. Create config: `src/config/yourModel.config.ts` (copy `shoeModel.config.ts` structure)
2. Register: Add to `MODEL_REGISTRY` in `src/config/models.registry.ts`
3. Use: `<ProductConfigurator modelId="your-model-v1" />`

**Key Files**:

- `src/stores/configuratorStore.ts` - Valtio proxy state
- `src/components/Configurator/ModelViewer.component.tsx` - Dynamic mesh rendering
- `src/types/configurator.ts` - Type definitions (ModelConfig, ModelPart, InteractivePart)

**Important**: ModelPart `nodeName` must match GLTF node names. Test with Blender or gltf.online.

## Component Naming Convention

Files use `.component.tsx` suffix (e.g., `SingleProduct.component.tsx`). Export `default function` for components, named exports for utilities.

## State Management

### Cart (Zustand)

- **Store**: `src/stores/cartStore.ts`
- **Persistence**: `zustand/middleware/persist` with localStorage sync
- **Session**: WooCommerce session token auto-managed by Apollo middleware
- **Operations**: `updateCart()` syncs both store and localStorage

### Configurator (Valtio)

- **Store**: `src/stores/configuratorStore.ts`
- **Usage**: `import { useSnapshot } from 'valtio'; const snap = useSnapshot(configuratorState);`
- **Initialization**: `initializeConfigurator(modelConfig)` on model load

## UI Components

Built with **Shadcn/UI** (Radix UI + Tailwind). Components live in `src/components/ui/`.

**Pattern**: Import from `@/components/ui/*`, customize via `cn()` utility and className prop.

```tsx
import { Button } from '@/components/ui/button';
<Button variant="default" size="lg">
  Add to Cart
</Button>;
```

**Design System**: `src/config/furniture.ts` - centralized colors, typography, spacing tokens.

### Reusable Components

**ProductGrid** (`src/components/Product/ProductGrid.component.tsx`):

- Unified component for displaying product grids with optional filters/sorting
- Replaces legacy `DisplayProducts` and `ProductList` components
- Usage: `<ProductGrid products={products} showFilters={true} showSorting={true} />`

**BreadcrumbNav** (`src/components/Layout/BreadcrumbNav.component.tsx`):

- Declarative breadcrumb navigation with auto-formatting
- Usage: `<BreadcrumbNav items={[{ label: 'Home', href: '/' }, { label: 'Current' }]} />`

**Price Components** (`src/components/UI/Price.component.tsx`):

- `<Price>` - Individual price display with auto-formatting (adds space after currency)
- `<PriceGroup>` - Smart component handling sale/regular prices
- Auto-formats currency (e.g., "kr1000" → "kr 1000")
- Usage: `<PriceGroup price={price} salePrice={salePrice} regularPrice={regularPrice} onSale={onSale} currency="kr" />`

**Typography** (`src/components/UI/Typography.component.tsx`):

- Always use Typography components (never raw `<h1>`, `<p>` tags)
- Components: `TypographyH1`, `TypographyH2`, `TypographyH3`, `TypographyH4`, `TypographyP`, `TypographyLarge`, `TypographySmall`, `TypographyMuted`
- Usage: `<TypographyH1 className="custom-class">{title}</TypographyH1>`

## Development Workflows

### Running Locally

```bash
npm run dev              # Next.js with Turbopack
npm run build            # Production build
npm run playwright       # E2E tests
npm run playwright:ui    # Interactive test UI
```

### Environment Variables

- `NEXT_PUBLIC_GRAPHQL_URL` - WPGraphQL endpoint
- `NEXT_PUBLIC_ENABLE_MOCKS` - Set `'true'` to run without backend (mocks in `src/utils/apollo/mockLink.ts`)
- Algolia: `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY`, `NEXT_PUBLIC_ALGOLIA_INDEX_NAME`

### Testing Strategy

- **E2E**: Playwright tests in `src/tests/` (Categories, Index pages)
- **CI**: Lighthouse CI performance monitoring (see `lighthouserc.json`)
- **Manual**: Multiple terminals - dev server + test commands separately

## GraphQL Patterns

**Queries/Mutations**: `src/utils/gql/` directory
**Type Safety**: Use TypeScript interfaces in `src/types/product.ts`

**Session Handling**: Apollo middleware automatically manages session tokens. No manual auth required.

## Copilot Behavior Guidelines

**DO NOT create analysis/summary documents** unless explicitly requested by user. This includes:

- `*_ANALYSIS.md`, `*_REVIEW.md`, `*_REPORT.md` files
- `*_SUMMARY.md`, `*_STATUS.md` files
- Quick reference guides or checklists in markdown format
- Any `.md` documentation files for internal tracking

**Instead**: Provide brief, direct answers in conversation. Only create files if user says "create", "write", or "add" a specific file.

## Common Pitfalls

1. **3D SSR**: Configurator uses dynamic imports (`next/dynamic`) with `ssr: false`
2. **Node Names**: 3D model node names are case-sensitive and must match config exactly
3. **Cart Sync**: Always use `updateCart()` not direct state mutation
4. **Turbopack**: GLB file handling configured in `next.config.js` webpack rules
5. **Component Suffix**: Follow `.component.tsx` convention for consistency

## File Organization

- `/src/pages/` - Next.js Pages Router routes
- `/src/components/` - React components (feature folders)
- `/src/config/` - Configuration files (models, site settings, design tokens)
- `/src/stores/` - State management (Zustand, Valtio)
- `/src/types/` - TypeScript interfaces
- `/src/utils/` - Utilities (apollo, auth, functions, gql)
- `/DOCS/` - Extended documentation (see `CONFIGURATOR.md`, `QUICK_START.md`)

## External Dependencies

**Required WP Plugins**: WooCommerce, WPGraphQL, WPGraphQL WooCommerce, wp-algolia-woo-indexer
**3D Stack**: @react-three/fiber, @react-three/drei, three
**Forms**: react-hook-form + zod validation
**Animations**: framer-motion (motion package), nprogress for route transitions
