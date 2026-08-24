import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Cart } from '@/types/cart';

export type { Cart } from '@/types/cart';

// Versioned localStorage keys to prevent crashes on schema changes
const WOOCOMMERCE_CART_KEY = 'woocommerce-cart:v1';
const WOO_SESSION_KEY = 'woo-session:v1';

interface CartState {
  cart: Cart | null;
  /** Replace the cart with a server-confirmed value and mirror it to storage. */
  replace: (cart: NonNullable<CartState['cart']>) => void;
  /** Clear the cart and the WooCommerce session keys. */
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      replace: (cart) => {
        set({ cart });
        localStorage.setItem(WOOCOMMERCE_CART_KEY, JSON.stringify(cart));
      },
      clear: () => {
        set({ cart: null });
        localStorage.removeItem(WOO_SESSION_KEY);
        localStorage.removeItem(WOOCOMMERCE_CART_KEY);
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
);
