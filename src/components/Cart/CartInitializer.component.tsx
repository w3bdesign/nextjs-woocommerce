import { useQuery } from '@apollo/client';
import { useEffect } from 'react';

// State
import { useCartStore } from '@/stores/cartStore';
import type { GetCartQuery } from '@/types/cart';

// Utils
import { getFormattedCart } from '@/utils/functions/functions';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

/**
 * Non-rendering component responsible for initializing the cart state
 * by fetching data from WooCommerce and syncing it with the Zustand store.
 * This should be rendered once at the application root (_app.tsx).
 * @function CartInitializer
 * @returns {null} - This component does not render any UI
 */
const CartInitializer = () => {
  const { syncWithWooCommerce } = useCartStore();

  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  });

  // Sync cart on data changes
  useEffect(() => {
    if (!data) return;
    // If cart shape is missing, do nothing
    if (!data?.cart?.contents?.nodes) return;
    const updatedCart = getFormattedCart(data as GetCartQuery);
    if (updatedCart) {
      syncWithWooCommerce(updatedCart);
    }
  }, [data, syncWithWooCommerce]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // This component does not render any UI
  return null;
};

export default CartInitializer;
