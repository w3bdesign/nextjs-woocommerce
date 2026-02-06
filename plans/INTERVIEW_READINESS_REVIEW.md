# Interview Readiness Review: nextjs-woocommerce

## Overall Assessment: 🟡 Good Foundation, Needs Targeted Fixes

This is a well-structured Next.js e-commerce project with solid fundamentals. It demonstrates competence in React, TypeScript, GraphQL, and state management. However, there are several **critical issues** and **interview red flags** that should be addressed before presenting this in an interview.

---

## 🔴 Critical Issues (Must Fix)

### 1. Bug in `getFormattedCart` — Shared Object Reference

**File:** [`getFormattedCart()`](src/utils/functions/functions.tsx:145)

The `product` object is declared **once** outside the loop, then mutated and pushed into the array on every iteration. Since JavaScript passes objects by reference, the array ends up with multiple references to the **same object** — all containing the data from the **last** product.

```typescript
// BUG: Single object mutated and pushed N times
const product: Product = { productId: 0, ... };
givenProducts.forEach(() => {
  product.productId = givenProduct.productId; // overwrites same object
  formattedCart.products.push(product); // pushes same reference
});
```

**Fix:** Create a new `product` object inside each iteration.

### 2. Deprecated `process.browser` Usage

**Files:** [`ApolloClient.js:22`](src/utils/apollo/ApolloClient.js:22), [`SingleProduct.component.tsx:42`](src/components/Product/SingleProduct.component.tsx:42), [`functions.tsx:301`](src/utils/functions/functions.tsx:301)

`process.browser` is deprecated in Next.js. Use `typeof window !== 'undefined'` instead. An interviewer familiar with Next.js will immediately spot this.

### 3. ApolloClient.js — Should Be TypeScript

**File:** [`ApolloClient.js`](src/utils/apollo/ApolloClient.js)

This is the **only `.js` file** in the entire `src/` directory. In a TypeScript project presented for an interview, having an untyped core utility file stands out. It also has a logic error on line 85:

```javascript
const clientSide = typeof window === 'undefined'; // This is BACKWARDS
// ...
ssrMode: clientSide, // This should be true on the server, but the variable name says "clientSide"
```

The variable is named `clientSide` but actually represents `serverSide`. The code _works_ correctly by accident (because `ssrMode` wants `true` when on the server), but the naming is misleading and will confuse interviewers.

### 4. Hardcoded `transactionId` in Checkout

**File:** [`createCheckoutData()`](src/utils/functions/functions.tsx:250)

```typescript
transactionId: 'fhggdfjgfi', // Hardcoded dummy value
```

This is a clear red flag — it looks like a placeholder that was never completed. Use `uuidv4()` or remove it.

### 5. `setTimeout` for Cart Refetch — Race Condition Anti-Pattern

**Files:** [`AddToCart.component.tsx:139`](src/components/Product/AddToCart.component.tsx:139), [`CheckoutForm.component.tsx:97`](src/components/Checkout/CheckoutForm.component.tsx:97), [`CartContents.component.tsx:47-48`](src/components/Cart/CartContents.component.tsx:47)

Using `setTimeout` to wait for server-side state to settle is fragile:

```typescript
const handleAddToCart = () => {
  addToCart();
  setTimeout(() => { refetch(); }, 2000); // Arbitrary 2-second delay
};
```

This can cause stale data on slow connections or race conditions on fast ones. The `onCompleted` callback of the mutation already calls `refetch()` — the extra `setTimeout` is redundant and risky.

### 6. README Version Mismatch

**File:** [`README.md:77-78`](README.md:77)

The README states "Next.js version 15.1.7" and "React version 18.3.1", but `package.json` shows **Next.js 16.1.6** and **React 19.2.4**. An interviewer checking the repo will notice this inconsistency.

---

## 🟡 Important Improvements (Should Fix)

### 7. Duplicate Type Definitions

Types are defined multiple times across the codebase instead of being shared:
- `IImage` defined in [`functions.tsx:18`](src/utils/functions/functions.tsx:18), [`AddToCart.component.tsx:19`](src/components/Product/AddToCart.component.tsx:19), and [`DisplayProducts.component.tsx:7`](src/components/Product/DisplayProducts.component.tsx:7)
- `Product` interface in [`cartStore.ts:4`](src/stores/cartStore.ts:4) and [`product.ts:32`](src/types/product.ts:32) — different interfaces, same name
- Several `IProductRootObject` interfaces with different shapes

**Fix:** Consolidate all types into [`src/types/`](src/types/) and import from there.

### 8. Missing Error Boundaries

No React Error Boundary exists in the app. If any component throws during render, the **entire application crashes**. Add at least one wrapping `<Layout>`.

### 9. No Unit Tests — Only 2 E2E Tests

**Files:** [`Index.spec.ts`](src/tests/Index/Index.spec.ts), [`Categories.spec.ts`](src/tests/Categories/Categories.spec.ts)

The project has only 2 Playwright test files with 3 total tests. There are no unit tests for:
- Custom hooks like [`useProductFilters`](src/hooks/useProductFilters.ts)
- Utility functions like [`getFormattedCart`](src/utils/functions/functions.tsx:145), [`filteredVariantPrice`](src/utils/functions/functions.tsx:132)
- Store logic

For an interview, having unit tests on at least the utility functions and hooks shows testing discipline.

### 10. `useQuery` Data Stale Closure in `onCompleted`

**Files:** [`AddToCart.component.tsx:113`](src/components/Product/AddToCart.component.tsx:113), [`CartContents.component.tsx:30`](src/components/Cart/CartContents.component.tsx:30)

```typescript
const { data, refetch } = useQuery(GET_CART, {
  onCompleted: () => {
    const updatedCart = getFormattedCart(data); // 'data' may be stale here
  },
});
```

The `onCompleted` callback captures `data` from the outer scope, but it may not yet be updated when the callback fires. Use the callback parameter instead:

```typescript
onCompleted: (freshData) => {
  const updatedCart = getFormattedCart(freshData);
},
```

### 11. `next/image` vs Raw `<img>` Tag Inconsistency

- [`ProductCard.component.tsx`](src/components/Product/ProductCard.component.tsx) uses `next/image` ✅
- [`DisplayProducts.component.tsx`](src/components/Product/DisplayProducts.component.tsx) uses raw `<img>` ❌
- [`SingleProduct.component.tsx`](src/components/Product/SingleProduct.component.tsx) uses raw `<img>` ❌
- ESLint rule `@next/next/no-img-element` is **disabled** in [`.eslintrc.json`](.eslintrc.json:7)

This inconsistency suggests the migration to `next/image` was incomplete. Either use `next/image` everywhere or have a clear reason for using raw `<img>`.

### 12. `uuidv4()` as React Key in `DisplayProducts`

**File:** [`DisplayProducts.component.tsx:78`](src/components/Product/DisplayProducts.component.tsx:78)

```tsx
<div key={uuidv4()} className="group">
```

Using `uuidv4()` as a key means React generates a **new key every render**, defeating React reconciliation and causing all items to unmount/remount. Use `slug` or `databaseId` instead.

### 13. `CartContents` Uses Deprecated `layout` and `objectFit` Props

**File:** [`CartContents.component.tsx:103-104`](src/components/Cart/CartContents.component.tsx:103)

```tsx
<Image layout="fill" objectFit="cover" />
```

These props were deprecated in Next.js 13+. Use the `fill` boolean prop and `style` or `className` instead.

### 14. Authentication Has Incomplete Implementation

**File:** [`auth.ts`](src/utils/auth.ts)

- [`hasCredentials()`](src/utils/auth.ts:5) always returns `false` — never actually checks auth
- [`getAuthToken()`](src/utils/auth.ts:15) always returns `null`
- [`logout()`](src/utils/auth.ts:85) just redirects to `/` without calling a logout mutation
- `REFRESH_AUTH_TOKEN` mutation in [`GQL_MUTATIONS.ts:40`](src/utils/gql/GQL_MUTATIONS.ts:40) exists but is unused
- `.env.example` still has JWT-related keys (`AUTH_TOKEN_SS_KEY`, `REFRESH_TOKEN_LS_KEY`) that are unused

### 15. Norwegian/English Language Mixing

The UI text is Norwegian, page URLs are Norwegian (`/handlekurv`, `/kasse`, `/kategorier`), but comments, variable names, component names, and the README are in English. This is fine for a Norwegian project, but worth mentioning in an interview — be prepared to explain the decision.

---

## 🟢 Strengths (Good Interview Talking Points)

| Area | Assessment |
|------|-----------|
| **Project Structure** | Well-organized component directory with clear naming convention |
| **Zustand Store** | Clean implementation with `persist` middleware and proper typing |
| **TypeScript Config** | Strict mode enabled, path aliases configured |
| **GraphQL Architecture** | Separate query/mutation files, good separation of concerns |
| **CI/CD Pipeline** | Lighthouse CI, Playwright CI, CodeQL, code quality badges |
| **Custom Hook** | `useProductFilters` demonstrates hook extraction pattern well |
| **Product Filtering** | Full-featured filtering with sizes, colors, price range, and sorting |
| **Form Handling** | React Hook Form with FormProvider pattern |
| **Protected Routes** | HOC pattern with `withAuth` for authenticated pages |
| **Accessibility** | `lang="nb-NO"` on HTML, ARIA labels on filters, semantic HTML |
| **Code Quality** | ESLint, Prettier, CodeClimate, Codacy, SonarCloud, CodeFactor |
| **SEO** | Meta tags, Open Graph, proper `<title>` per page |

---

## Priority Fix Plan

### Phase 1: Critical Bug Fixes
- [ ] Fix shared object reference bug in `getFormattedCart`
- [ ] Replace all `process.browser` with `typeof window !== 'undefined'`
- [ ] Convert `ApolloClient.js` to TypeScript and fix `clientSide` naming
- [ ] Remove hardcoded `transactionId`, use `uuidv4()`
- [ ] Remove redundant `setTimeout` refetch calls
- [ ] Update README version numbers

### Phase 2: Code Quality
- [ ] Fix `uuidv4()` React keys in `DisplayProducts`
- [ ] Use `onCompleted` parameter instead of outer `data` scope in `useQuery`
- [ ] Fix deprecated `layout`/`objectFit` props in `CartContents`
- [ ] Consolidate duplicate type definitions into `src/types/`
- [ ] Replace raw `<img>` tags with `next/image` or document the reason

### Phase 3: Interview Polish
- [ ] Add an Error Boundary component
- [ ] Add unit tests for `getFormattedCart`, `filteredVariantPrice`, and `useProductFilters`
- [ ] Clean up unused auth code or complete the implementation
- [ ] Remove unused `babel-plugin-styled-components` from devDependencies
- [ ] Add `data-testid` attributes to key interactive elements for testability
