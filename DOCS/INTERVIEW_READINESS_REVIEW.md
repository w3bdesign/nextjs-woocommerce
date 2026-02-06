# Interview Readiness Review: nextjs-woocommerce

## Post-Fix Assessment: 🟢 Solid — Ready with Minor Polish

After addressing the 6 critical issues, the codebase is in significantly better shape. The remaining items are quality improvements rather than interview red flags.

---

## ✅ Previously Critical — Now Fixed

| # | Issue | Status |
|---|-------|--------|
| 1 | Shared object reference bug in [`getFormattedCart()`](src/utils/functions/functions.tsx:145) | ✅ Fixed — each product is now a new object per iteration |
| 2 | Deprecated `process.browser` in 3 files | ✅ Fixed — all use `typeof window !== 'undefined'` |
| 3 | [`ApolloClient.js`](src/utils/apollo/ApolloClient.ts) was untyped JS with misleading naming | ✅ Converted to TypeScript with `SessionData` interface, `isServerSide` naming |
| 4 | Hardcoded `transactionId: 'fhggdfjgfi'` | ✅ Fixed — now uses `uuidv4()` |
| 5 | `setTimeout` refetch calls | ✅ Kept with explanatory comments — required by WooCommerce backend latency; added `refetchQueries` to AddToCart mutation |
| 6 | README version mismatch | ✅ Updated to Next.js 16.1.6 / React 19.2.4 |

---

## 🟡 Remaining Improvements (Phase 2 — Code Quality)

### 1. Stale Closure in `onCompleted` Callbacks

**Files:** [`AddToCart.component.tsx:112`](src/components/Product/AddToCart.component.tsx:112), [`CartContents.component.tsx:29`](src/components/Cart/CartContents.component.tsx:29), [`CheckoutForm.component.tsx:62`](src/components/Checkout/CheckoutForm.component.tsx:62)

The `onCompleted` callback references `data` from the outer scope instead of using the callback parameter:

```typescript
// Current — data may be stale
onCompleted: () => {
  const updatedCart = getFormattedCart(data);
}

// Better — use the fresh data from the callback
onCompleted: (freshData) => {
  const updatedCart = getFormattedCart(freshData);
}
```

**Risk:** Low-to-medium. Works in practice because `notifyOnNetworkStatusChange: true` forces re-renders, but it's technically incorrect and an interviewer who knows Apollo well could question it.

### 2. Duplicate Type Definitions

Types are defined multiple times instead of being shared from a central location:
- `IImage` defined in [`functions.tsx:18`](src/utils/functions/functions.tsx:18), [`AddToCart.component.tsx:19`](src/components/Product/AddToCart.component.tsx:19), and [`DisplayProducts.component.tsx:7`](src/components/Product/DisplayProducts.component.tsx:7)
- `Product` interface exists in both [`cartStore.ts:4`](src/stores/cartStore.ts:4) and [`product.ts:32`](src/types/product.ts:32) with different shapes
- Multiple `IProductRootObject` interfaces with different shapes

**Interview concern:** Shows this hasn't been refactored yet. Consolidating to `src/types/` would demonstrate attention to DRY principles.

### 3. `uuidv4()` Used as React Key

**File:** [`DisplayProducts.component.tsx:78`](src/components/Product/DisplayProducts.component.tsx:78)

```tsx
<div key={uuidv4()} className="group">
```

This generates a **new key every render**, defeating React's reconciliation algorithm and causing unnecessary DOM re-creation. Should use `slug` or `databaseId`.

### 4. Deprecated `next/image` Props

**File:** [`CartContents.component.tsx:105`](src/components/Cart/CartContents.component.tsx:105)

```tsx
<Image layout="fill" objectFit="cover" />
```

The `layout` and `objectFit` props were deprecated in Next.js 13+. With Next.js 16, these should use the `fill` prop and CSS/className for styling instead.

### 5. Inconsistent Image Component Usage

- [`ProductCard.component.tsx`](src/components/Product/ProductCard.component.tsx) — uses `next/image` ✅
- [`DisplayProducts.component.tsx`](src/components/Product/DisplayProducts.component.tsx) — uses raw `<img>` ❌
- [`SingleProduct.component.tsx`](src/components/Product/SingleProduct.component.tsx) — uses raw `<img>` ❌
- ESLint rule `@next/next/no-img-element` is disabled in [`.eslintrc.json:7`](.eslintrc.json:7)

### 6. Missing Error Boundary

No React Error Boundary exists. If any component throws during render, the entire application crashes with no fallback UI.

### 7. Incomplete Authentication Implementation

**File:** [`auth.ts`](src/utils/auth.ts)

- [`hasCredentials()`](src/utils/auth.ts:5) always returns `false`
- [`getAuthToken()`](src/utils/auth.ts:15) always returns `null`
- [`logout()`](src/utils/auth.ts:85) only redirects without calling a logout mutation
- `REFRESH_AUTH_TOKEN` mutation in [`GQL_MUTATIONS.ts:40`](src/utils/gql/GQL_MUTATIONS.ts:40) is defined but never used
- `.env.example` has unused JWT-related keys

**Interview concern:** If asked about the auth flow, be prepared to explain this is cookie-based auth and these functions are stubs/placeholders.

### 8. Unused DevDependency

[`package.json:56`](package.json:56) includes `babel-plugin-styled-components` but styled-components isn't used anywhere in the project. The project uses Tailwind CSS for styling.

---

## 🔵 Phase 3 — Interview Polish (Nice-to-have)

### 9. Limited Test Coverage

Only 2 Playwright test files with 3 total tests:
- [`Index.spec.ts`](src/tests/Index/Index.spec.ts) — 1 test checking for h1 element
- [`Categories.spec.ts`](src/tests/Categories/Categories.spec.ts) — 2 tests for navigation

No unit tests exist for:
- Utility functions ([`getFormattedCart`](src/utils/functions/functions.tsx:145), [`filteredVariantPrice`](src/utils/functions/functions.tsx:132), [`paddedPrice`](src/utils/functions/functions.tsx:111))
- Custom hooks ([`useProductFilters`](src/hooks/useProductFilters.ts))
- Zustand store logic

Adding even 3-5 unit tests for the utility functions would significantly strengthen the testing story.

### 10. Import Organization in `functions.tsx`

**File:** [`functions.tsx:13`](src/utils/functions/functions.tsx:13)

The `ChangeEvent` import from React is placed between an interface declaration and a comment, instead of being grouped with other imports at the top.

### 11. `getUpdatedItems` Could Be Simplified

**File:** [`functions.tsx:237`](src/utils/functions/functions.tsx:237)

The current implementation uses `.forEach` + push. Could be simplified with `.map`:

```typescript
export const getUpdatedItems = (products, newQty, cartKey) =>
  products.map((item) => ({
    key: item.key,
    quantity: item.key === cartKey ? newQty : item.quantity,
  }));
```

---

## 🟢 Strengths (Good Interview Talking Points)

| Area | Assessment |
|------|-----------|
| **Project Structure** | Well-organized component directory with clear `.component.tsx` naming convention |
| **Zustand Store** | Clean implementation with `persist` middleware, `partialize`, and proper typing |
| **TypeScript** | Strict mode enabled, path aliases configured, now fully TypeScript |
| **Apollo Client** | Properly typed with `SessionData` interface, clear middleware/afterware separation |
| **GraphQL Architecture** | Separate query/mutation files, good separation of concerns |
| **CI/CD Pipeline** | Lighthouse CI, Playwright CI, CodeQL, 5 code quality badges |
| **Custom Hook** | [`useProductFilters`](src/hooks/useProductFilters.ts) demonstrates clean hook extraction |
| **Product Filtering** | Full-featured with sizes, colors, price range, sorting, and product type filters |
| **Form Handling** | React Hook Form with `FormProvider` pattern for checkout billing |
| **Protected Routes** | HOC pattern with [`withAuth`](src/components/User/withAuth.component.tsx) for authenticated pages |
| **Accessibility** | `lang="nb-NO"` on HTML, ARIA labels on filters, semantic HTML structure |
| **Code Quality Tooling** | ESLint, Prettier, CodeClimate, Codacy, SonarCloud, CodeFactor |
| **SEO** | Meta tags, Open Graph, proper `<title>` per page |
| **Cart Architecture** | Zustand + WooCommerce session sync with persist middleware |

---

## Remaining Fix Priority

### Should Fix Before Interview
- [ ] Fix `uuidv4()` React keys in [`DisplayProducts.component.tsx:78`](src/components/Product/DisplayProducts.component.tsx:78)
- [ ] Use `onCompleted` parameter instead of outer `data` scope in `useQuery` callbacks
- [ ] Fix deprecated `layout`/`objectFit` Image props in [`CartContents.component.tsx:105`](src/components/Cart/CartContents.component.tsx:105)

### Good to Fix if Time Allows
- [ ] Add an Error Boundary component wrapping Layout
- [ ] Consolidate duplicate type definitions into `src/types/`
- [ ] Add unit tests for utility functions
- [ ] Replace raw `<img>` with `next/image` in `DisplayProducts` and `SingleProduct`
- [ ] Clean up unused auth stubs and `babel-plugin-styled-components` dependency
- [ ] Add `data-testid` attributes to key interactive elements
