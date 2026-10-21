import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import { useCartStore } from '@/stores/cartStore';
import { getFormattedCart } from '@/utils/functions/functions';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

/** Fetch the cart and synchronize successful results with the cart store. */
export const useCartQuery = ({ clearEmptyCart = false } = {}) => {
  const syncWithWooCommerce = useCartStore(
    (state) => state.syncWithWooCommerce,
  );
  const clearWooCommerceSession = useCartStore(
    (state) => state.clearWooCommerceSession,
  );
  const result = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  });
  const { data, loading, error } = result;

  useEffect(() => {
    if (loading || error || !data?.cart) return;

    const updatedCart = getFormattedCart(data);
    if (updatedCart) {
      syncWithWooCommerce(updatedCart);
    } else if (clearEmptyCart && !data.cart.contents?.nodes?.length) {
      clearWooCommerceSession();
    }
  }, [
    data,
    loading,
    error,
    clearEmptyCart,
    syncWithWooCommerce,
    clearWooCommerceSession,
  ]);

  return result;
};
