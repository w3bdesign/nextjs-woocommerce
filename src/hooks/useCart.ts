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
   * Reconcile a cart payload (from the query or a mutation) with the store:
   * write the formatted cart when there are contents, clear the session when it
   * has genuinely emptied.
   */
  const syncFromServer = useCallback(
    (payload: IFormattedCartProps | null | undefined) => {
      const formatted = getFormattedCart(payload ?? undefined);
      if (formatted) {
        replace(formatted);
        return;
      }
      // No contents in a settled server response — the cart is truly empty.
      if (!payload?.cart?.contents?.nodes?.length) {
        clear();
      }
    },
    [replace, clear],
  );

  const { error, refetch, networkStatus } = useQuery<IFormattedCartProps>(
    GET_CART,
    {
      notifyOnNetworkStatusChange: true,
      onCompleted: syncFromServer,
    },
  );

  // isLoading is true only until the first fetch settles for this mount.
  const isLoading =
    networkStatus === NetworkStatus.loading ||
    networkStatus === NetworkStatus.setVariables;

  const [addToCart, { loading: addLoading }] = useMutation<IAddToCartData>(
    ADD_TO_CART,
    {
      onCompleted: (result) => syncFromServer(result?.addToCart),
    },
  );

  const [updateCart, { loading: updateLoading }] = useMutation<IUpdateCartData>(
    UPDATE_CART,
    {
      onCompleted: (result) => syncFromServer(result?.updateItemQuantities),
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
  };
};

export default useCart;
