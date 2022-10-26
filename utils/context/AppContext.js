import React, { useState, useEffect, createContext } from 'react';

export const AppContext = createContext();

/**
 * Provides a global application context for the entire application with the cart contents
 * @param {Object} props
 */
export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    // Check if we are client-side before we access the localStorage
    if (process.browser) {
      let cartData = localStorage.getItem('woocommerce-cart');
      cartData = null !== cartData ? JSON.parse(cartData) : '';
      setCart(cartData);
    }
  }, []);
  
  return (
    <AppContext.Provider value={[cart, setCart]}>
      {children}
    </AppContext.Provider>
  );
};
