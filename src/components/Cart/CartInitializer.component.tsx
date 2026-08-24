import { useCart } from '@/hooks/useCart';

/**
 * Non-rendering component that mounts the Cart module once at the application
 * root (_app.tsx). All fetch/format/sync behaviour lives inside useCart().
 * @function CartInitializer
 * @returns {null} - This component does not render any UI
 */
const CartInitializer = () => {
  useCart();
  return null;
};

export default CartInitializer;
