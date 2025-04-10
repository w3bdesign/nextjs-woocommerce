# Cart Refactoring TODO

**Goal:** Move cart fetching and initialization logic out of `src/components/Layout/Layout.component.tsx` to improve separation of concerns, adhere to DRY principles, and centralize global state initialization.

**Current State:**
*   `src/components/Layout/Layout.component.tsx` uses `useQuery(GET_CART)` to fetch cart data, formats it using `getFormattedCart`, and syncs it with the Zustand store (`useCartStore`) via `syncWithWooCommerce`. It also uses `useEffect` to `refetch` the cart.

**Proposed Refactoring Steps:**

**Step 1: Create the Cart Initializer Component**

1.  **Create File:** Create a new file named `src/components/Cart/CartInitializer.component.tsx`.
2.  **Add Content:** Populate the file with the following code. This component will encapsulate the cart fetching and synchronization logic previously in `Layout.component.tsx`.

    ```typescript
    // src/components/Cart/CartInitializer.component.tsx
    import { useEffect } from 'react';
    import { useQuery } from '@apollo/client';

    // State
    import { useCartStore } from '@/stores/cartStore';

    // Utils
    import { getFormattedCart } from '@/utils/functions/functions';

    // GraphQL
    import { GET_CART } from '@/utils/gql/GQL_QUERIES';

    /**
     * Non-rendering component responsible for initializing the cart state
     * by fetching data from WooCommerce and syncing it with the Zustand store.
     * This should be rendered once at the application root (_app.tsx).
     */
    const CartInitializer = () => {
      const { syncWithWooCommerce } = useCartStore();

      const { data, refetch } = useQuery(GET_CART, {
        notifyOnNetworkStatusChange: true,
        onCompleted: () => {
          // On successful fetch, format the data and sync with the store
          const updatedCart = getFormattedCart(data);
          if (updatedCart) {
            syncWithWooCommerce(updatedCart);
          }
        },
        // Consider error handling if needed (e.g., onError callback)
      });

      // Refetch cart data on component mount or potentially other dependencies
      // Ensure this doesn't cause unnecessary refetches if not needed.
      // If refetching is only needed once on load, this might be redundant
      // if useQuery fetches automatically on mount. Review Apollo Client cache policy.
      useEffect(() => {
        refetch();
      }, [refetch]);

      // This component does not render any UI
      return null;
    };

    export default CartInitializer;
    ```

**Step 2: Integrate Cart Initializer into `_app.tsx`**

1.  **Edit File:** Open `src/pages/_app.tsx`.
2.  **Import:** Add the following import statement at the top:
    ```typescript
    import CartInitializer from '@/components/Cart/CartInitializer.component';
    ```
3.  **Render:** Locate the main return statement within the `MyApp` component. Inside the outermost fragment or div, *before* the `<Component {...pageProps} />` line, add the `CartInitializer` component. It should look something like this (adjust based on the exact structure of your `_app.tsx`):

    ```typescript
    // Example structure within MyApp component in src/pages/_app.tsx
    return (
      <ApolloProvider client={apolloClient}>
        {/* Other providers might be here */}
        <CartInitializer /> {/* <-- Add this line */}
        <Component {...pageProps} />
        {/* Other global components might be here */}
      </ApolloProvider>
    );
    ```

**Step 3: Clean up `Layout.component.tsx`**

1.  **Edit File:** Open `src/components/Layout/Layout.component.tsx`.
2.  **Remove Imports:** Delete the following import lines:
    ```typescript
    import { useEffect } from 'react'; // If not used elsewhere in the file
    import { useQuery } from '@apollo/client';
    import { useCartStore } from '@/stores/cartStore';
    import { getFormattedCart } from '@/utils/functions/functions';
    import { GET_CART } from '@/utils/gql/GQL_QUERIES';
    ```
3.  **Remove Hook Call:** Delete the line:
    ```typescript
    const { syncWithWooCommerce } = useCartStore();
    ```
4.  **Remove `useQuery`:** Delete the entire `useQuery` hook call block:
    ```typescript
    const { data, refetch } = useQuery(GET_CART, {
      notifyOnNetworkStatusChange: true,
      onCompleted: () => {
        const updatedCart = getFormattedCart(data);
        if (updatedCart) {
          syncWithWooCommerce(updatedCart);
        }
      },
    });
    ```
5.  **Remove `useEffect`:** Delete the `useEffect` hook block:
    ```typescript
    useEffect(() => {
      refetch();
    }, [refetch]);
    ```
6.  **Verify:** Ensure `Layout.component.tsx` now only contains logic related to page structure and passing the `title` prop.

**Verification:**
*   After implementing these changes, run the application.
*   Check that the cart icon in the header still displays the correct item count.
*   Navigate to the cart page (`/handlekurv`) and verify its contents are displayed correctly.
*   Add/remove items from the cart and ensure the state updates correctly across the application.
