import { useEffect, useSyncExternalStore } from 'react';
import { useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

import { useCartQuery } from '@/hooks/useCartQuery';
import { getUpdatedItems } from '@/utils/functions/functions';
import type { IProductRootObject } from '@/utils/functions/functions';
import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

const noopSubscribe = () => () => {};

/**
 * Cart data and actions for the cart and checkout pages.
 *
 * The cart lives in the browser's WooCommerce session, so the server cannot know its
 * contents. `isInitialLoad` stays true on the server, during hydration and until the
 * first fetch returns, so the server HTML matches the first client render and an
 * existing cart never flashes as empty.
 */
export const useCart = () => {
  const { data, loading, refetch } = useCartQuery({ clearEmptyCart: true });

  const hasMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const [updateCart, { loading: isUpdating }] = useMutation(UPDATE_CART, {
    onCompleted: () => {
      refetch();
      // Delayed refetch to ensure WooCommerce backend has settled
      setTimeout(() => {
        refetch();
      }, 2000);
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const items: IProductRootObject[] = data?.cart?.contents?.nodes ?? [];

  /** Set a cart line to an exact quantity; 0 removes it. */
  const setQuantity = (cartKey: string, quantity: number) => {
    if (isUpdating || !items.length || quantity < 0) return;
    updateCart({
      variables: {
        input: {
          clientMutationId: uuidv4(),
          items: getUpdatedItems(items, quantity, cartKey),
        },
      },
    });
  };

  return {
    items,
    total: data?.cart?.total || '0',
    isInitialLoad: !hasMounted || (loading && !data),
    isUpdating,
    setQuantity,
  };
};
