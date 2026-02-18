# React Doctor TODO — Score: 92/100

> **47 warnings** across **26/68 files** — scanned in 3.7s
> Share results: https://www.react.doctor/share?p=nextjs-woocommerce&s=92&w=47&f=26

---

## 🔧 Next.js Issues

### Replace `<img>` with `next/image` (4 instances)

Provides automatic WebP/AVIF, lazy loading, and responsive srcset.

- [ ] `src/components/AlgoliaSearch/SearchResults.component.tsx` — line 45
- [ ] `src/components/Product/SingleProduct.component.tsx` — line 81
- [ ] `src/components/Product/DisplayProducts.component.tsx` — line 55
- [ ] `src/components/Product/DisplayProducts.component.tsx` — line 62

### Add `sizes` attribute to `next/image` with `fill` (1 instance)

The browser downloads the largest image without `sizes`. Add `sizes="(max-width: 768px) 100vw, 50vw"` matching your layout breakpoints.

- [ ] `src/components/Index/Hero.component.tsx` — line 12

### Remove client-side redirect in useEffect (1 instance)

Use `redirect('/path')` from `next/navigation` in a Server Component, or handle in middleware.

- [ ] `src/components/User/withAuth.component.tsx` — line 23

---

## 📦 Bundle Size

### Use `LazyMotion` + `m` instead of `motion` (3 instances)

Use `import { LazyMotion, m } from "framer-motion"` with `domAnimation` features — saves ~30kb.

- [x] `src/components/Animations/FadeUp.component.tsx` — line 1 ✅ Replaced `motion` with `LazyMotion` + `m`
- [x] `src/components/Animations/FadeLeftToRightItem.component.tsx` — line 1 ✅ Replaced `motion` with `m`
- [x] `src/components/Animations/FadeLeftToRight.component.tsx` — line 1 ✅ Replaced `motion` with `LazyMotion` + `m`

---

## ♿ Accessibility

### Add keyboard event listener + role to clickable non-interactive element (2 issues, 1 file)

Visible, non-interactive elements with click handlers must have `keyup`, `keydown`, or `keypress` listener and a `role` attribute.

- [x] `src/components/SVG/SVGMobileSearchIcon.component.tsx` — line 15 ✅ Added `onKeyDown`, `role="button"`, `tabIndex={0}`, `aria-label`

---

## ⚛️ State & Effects

### Refactor 8 `setState` calls in a single `useEffect` to `useReducer` (1 instance)

Combine into `useReducer`: `const [state, dispatch] = useReducer(reducer, initialState)`.

- [x] `src/components/Footer/Hamburger.component.tsx` — line 30 ✅ Refactored to `useReducer` with `HamburgerState` / `HamburgerAction`

### Move `useEffect` simulating event handler to an actual event handler (1 instance)

Move the conditional logic into `onClick`, `onChange`, or `onSubmit` handlers directly.

- [x] `src/components/Header/Cart.component.tsx` — line 18 ✅ Replaced `useEffect` + `useState` with derived state `cart?.totalProductsCount ?? null`

---

## 🗑️ Dead Code — Unused Files (4 files)

These files are not imported by any other file in the project.

- [ ] `src/styles/algolia.min.css`
- [ ] `src/styles/animate.min.css`
- [ ] `src/components/Animations/FadeUp.component.tsx`
- [ ] `src/components/User/UserRegistration.component.tsx`

---

## 🗑️ Dead Code — Unused Exports (8 exports)

- [ ] `src/utils/apollo/ApolloClient.ts` — `middleware`
- [ ] `src/utils/apollo/ApolloClient.ts` — `afterware`
- [ ] `src/utils/gql/GQL_QUERIES.ts` — `FETCH_FIRST_PRODUCTS_FROM_HOODIES_QUERY`
- [ ] `src/utils/gql/GQL_MUTATIONS.ts` — `CREATE_USER`
- [ ] `src/utils/gql/GQL_MUTATIONS.ts` — `REFRESH_AUTH_TOKEN`
- [ ] `src/utils/auth.ts` — `hasCredentials`
- [ ] `src/utils/auth.ts` — `getAuthToken`
- [ ] `src/utils/auth.ts` — `logout`

---

## 🗑️ Dead Code — Unused Types (22 types)

### `src/types/product.ts`

- [ ] `Node`
- [ ] `IVariationNameNode`

### `src/stores/cartStore.ts`

- [ ] `CartProduct`
- [ ] `Cart`

### `src/types/graphql.ts`

- [ ] `IGraphQLImage`
- [ ] `IGalleryImages`
- [ ] `ICartProductNode`
- [ ] `IVariationNode`
- [ ] `IUpdateCartItem`
- [ ] `IUpdateCartInput`

### `src/utils/functions/functions.tsx`

- [ ] `ICheckoutDataProps`
- [ ] `IUpdateCartItem`
- [ ] `IUpdateCartInput`
- [ ] `IUpdateCartVariables`
- [ ] `IUpdateCartMutationArgs`
- [ ] `IUpdateCartRootObject`

### `src/components/Animations/types/Animations.types.ts`

- [ ] `IAnimateBounceProps`
- [ ] `IAnimateWithDelayProps`

### `src/components/Input/InputField.component.tsx`

- [ ] `IInputRootObject`

### `src/components/Product/AddToCart.component.tsx`

- [ ] `IProduct`
- [ ] `IProductRootObject`
- [ ] `IVariationNodes`
