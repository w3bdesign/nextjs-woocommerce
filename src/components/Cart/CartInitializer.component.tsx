import { useEffect } from 'react';
import { useCartQuery } from '@/hooks/useCartQuery';

/**
 * Non-rendering component responsible for initializing the cart state
 * by fetching data from WooCommerce and syncing it with the Zustand store.
 * This should be rendered once at the application root (_app.tsx).
 * @function CartInitializer
 * @returns {null} - This component does not render any UI
 */
const CartInitializer = () => {
  const { refetch } = useCartQuery();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // This component does not render any UI
  return null;
};

export default CartInitializer;
