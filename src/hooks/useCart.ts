import { useCallback, useEffect } from 'react';
import {
  NetworkStatus,
  useMutation,
  useQuery,
  type ApolloError,
} from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

// State
import { useCartStore } from '@/stores/cartStore';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { ADD_TO_CART, UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

// Private helpers of the Cart module
import { getFormattedCart, getUpdatedItems } from './cart/cartUtils';

// Types
import type { Cart } from '@/types/cart';
import type {
  IAddToCartData,
  IUpdateCartData,
  IFormattedCartProps,
} from '@/types/graphql';

export interface UseCartResult {
  /** Formatted, client-side cart. Null when empty or not yet loaded. */
  cart: Cart | null;
  /** True until the first GET_CART for this mount has settled. */
  isLoading: boolean;
  /** True while an add/update/remove mutation is in flight. */
  isUpdating: boolean;
  /** Set if the cart query failed. */
  error?: ApolloError;
  /** Add a product (optionally a variation) to the cart. */
  addItem: (productId: number, variationId?: number) => void;
  /** Set the quantity of a single line item by cart key. */
  setQuantity: (cartKey: string, quantity: number) => void;
  /** Remove a single line item by cart key. */
  removeItem: (cartKey: string) => void;
  /** Force a re-read of the cart from WooCommerce. */
  refetchCart: () => void;
  /**
   * Explicitly empty the cart client-side. Use after an event that empties the
   * server cart out-of-band (e.g. a completed checkout), where a refetch would
   * be ignored by the populate-only query path.
   */
  clearCart: () => void;
}

/**
 * The Cart module's single public interface.
 *
 * Owns the entire fetch → format → sync ritual that used to be copy-pasted
 * across CartInitializer, CartContents, AddToCart and CheckoutForm. Query,
 * mutations, formatting, store sync and empty-cart session clearing are all
 * implementation details behind this hook.
 *
 * The mutations return the whole authoritative cart (the same selection as
 * GET_CART, via the shared CartFields fragment), so `onCompleted` formats that
 * response and writes it straight to the store. There is no settle-refetch and
 * no timer: the server's own mutation reply is the source of truth, which also
 * removes the race that the old `setTimeout(refetch)` hack papered over.
 *
 * Rendering reads the persisted store `cart` (so the UI never flashes empty on
 * hydration); decisions that could destroy the session — showing the empty
 * state, clearing the session — are gated on `!isLoading` so they never act on
 * an unvalidated cache.
 */
export const useCart = (): UseCartResult => {
  const cart = useCartStore((state) => state.cart);
  const replace = useCartStore((state) => state.replace);
  const clear = useCartStore((state) => state.clear);

  /**
   * Reconcile a cart payload with the store.
   *
   * `allowClear` distinguishes the two callers, which have different authority
   * over "empty":
   *
   * - **Query (`allowClear = false`, populate-only):** a GET_CART fired on mount
   *   can race the WooCommerce session and come back empty before the session
   *   has propagated. An empty *read* is therefore NOT proof the cart is empty,
   *   so it must never destroy state — it simply has nothing to populate. (This
   *   is the race the old `setTimeout(refetch)` hack papered over.)
   * - **Mutation (`allowClear = true`, authoritative):** an add/update/remove
   *   reply reflects a write the user just made. An empty cart here is a real
   *   "the last item was removed" signal, so clearing is correct.
   */
  const syncFromServer = useCallback(
    (payload: IFormattedCartProps | null | undefined, allowClear: boolean) => {
      const formatted = getFormattedCart(payload ?? undefined);
      if (formatted) {
        replace(formatted);
        return;
      }
      // Only a confirmed-empty mutation reply may clear the cart. An empty read
      // is ignored so a session race can never wipe a populated cart.
      if (allowClear && !payload?.cart?.contents?.nodes?.length) {
        clear();
      }
    },
    [replace, clear],
  );

  const { error, refetch, networkStatus } = useQuery<IFormattedCartProps>(
    GET_CART,
    {
      notifyOnNetworkStatusChange: true,
      // Query results are populate-only: never clear on an empty read.
      onCompleted: (data) => syncFromServer(data, false),
    },
  );

  // isLoading is true only until the first fetch settles for this mount.
  const isLoading =
    networkStatus === NetworkStatus.loading ||
    networkStatus === NetworkStatus.setVariables;

  const [addToCart, { loading: addLoading }] = useMutation<IAddToCartData>(
    ADD_TO_CART,
    {
      // Mutation reply is authoritative: allow it to clear a confirmed-empty cart.
      onCompleted: (result) => syncFromServer(result?.addToCart, true),
    },
  );

  const [updateCart, { loading: updateLoading }] = useMutation<IUpdateCartData>(
    UPDATE_CART,
    {
      // Mutation reply is authoritative (this is how removeItem empties the cart).
      onCompleted: (result) =>
        syncFromServer(result?.updateItemQuantities, true),
      onError: async () => {
        const { data } = await refetch();
        syncFromServer(data, true);
      },
    },
  );

  const addItem = useCallback(
    (productId: number, variationId?: number) => {
      addToCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            productId,
            ...(variationId ? { variationId } : {}),
          },
        },
      });
    },
    [addToCart],
  );

  const setQuantity = useCallback(
    (cartKey: string, quantity: number) => {
      // Derive the update from the same store cart the UI renders from, so the
      // mutation input can never disagree with what the user sees.
      const products = cart?.products ?? [];
      if (!products.length) {
        return;
      }
      updateCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            items: getUpdatedItems(products, quantity, cartKey),
          },
        },
      });
    },
    [cart, updateCart],
  );

  const removeItem = useCallback(
    (cartKey: string) => setQuantity(cartKey, 0),
    [setQuantity],
  );

  // Reconcile with WooCommerce on mount.
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    cart,
    isLoading,
    isUpdating: addLoading || updateLoading,
    error,
    addItem,
    setQuantity,
    removeItem,
    refetchCart: refetch,
    clearCart: clear,
  };
};

export default useCart;
