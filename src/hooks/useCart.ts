import { useCallback, useEffect, useRef } from 'react';
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
import type { ICartItemNode, IFormattedCartProps } from '@/types/graphql';

/**
 * How long to wait before the reconciling refetch fires. WooCommerce needs a
 * moment for the session/cart to settle after a mutation; a single source of
 * truth for this delay replaces the 2s/3s copies scattered across components.
 */
const SETTLE_REFETCH_MS = 2000;

export interface UseCartResult {
  /** Formatted, client-side cart. Null when empty or not yet loaded. */
  cart: Cart | null;
  /** True until the first GET_CART for this mount has settled. */
  isLoading: boolean;
  /** True while an add/update/remove mutation (or its settle refetch) is in flight. */
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
 * Owns the entire fetch → format → sync → settle-refetch ritual that used to be
 * copy-pasted across CartInitializer, CartContents, AddToCart and CheckoutForm.
 * Query, mutations, formatting, the settle-refetch hack, store sync and
 * empty-cart session clearing are all implementation details behind this hook.
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

  // Track pending settle-refetch timers so they can be cleared on unmount.
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data,
    error,
    refetch,
    networkStatus,
  } = useQuery<IFormattedCartProps>(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (completed) => {
      const formatted = getFormattedCart(completed);
      if (!formatted && !completed?.cart?.contents?.nodes?.length) {
        // Cart is genuinely empty after a settled fetch — clear the session.
        clear();
        return;
      }
      if (formatted) {
        replace(formatted);
      }
    },
  });

  // isLoading is true only until the first fetch settles for this mount.
  const isLoading =
    networkStatus === NetworkStatus.loading ||
    networkStatus === NetworkStatus.setVariables;

  const scheduleSettleRefetch = useCallback(() => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
    }
    settleTimer.current = setTimeout(() => {
      refetch();
      settleTimer.current = null;
    }, SETTLE_REFETCH_MS);
  }, [refetch]);

  const [addToCart, { loading: addLoading }] = useMutation(ADD_TO_CART, {
    onCompleted: scheduleSettleRefetch,
  });

  const [updateCart, { loading: updateLoading }] = useMutation(UPDATE_CART, {
    onCompleted: () => {
      refetch();
      scheduleSettleRefetch();
    },
  });

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
      const nodes: ICartItemNode[] = data?.cart?.contents?.nodes ?? [];
      if (!nodes.length) {
        return;
      }
      updateCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            items: getUpdatedItems(nodes, quantity, cartKey),
          },
        },
      });
    },
    [data, updateCart],
  );

  const removeItem = useCallback(
    (cartKey: string) => setQuantity(cartKey, 0),
    [setQuantity],
  );

  // Reconcile with WooCommerce on mount.
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Clear any pending settle timer on unmount.
  useEffect(
    () => () => {
      if (settleTimer.current) {
        clearTimeout(settleTimer.current);
      }
    },
    [],
  );

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
