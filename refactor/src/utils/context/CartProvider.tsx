import { useState, useEffect, createContext } from 'react';

const CartContext = createContext<any>(null);

/**
 * Provides a global application context for the entire application with the cart contents
 * @param {Object} props
 */
export const CartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<any>(null);

  useEffect(() => {
    // Check if we are client-side before we access the localStorage
    if (!process.browser) {
      return;
    }
    let cartData = localStorage.getItem('woocommerce-cart');
    cartData = null !== cartData ? JSON.parse(cartData) : '';
    setCart(cartData);
  }, []);

  return (
    <CartContext.Provider value={[cart, setCart]}>
      {children}
    </CartContext.Provider>
  );
};
