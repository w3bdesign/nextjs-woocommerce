import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Cart } from '@/types/cart';

export type { Cart } from '@/types/cart';

// Versioned localStorage key to prevent crashes on schema changes
const WOOCOMMERCE_CART_KEY = 'woocommerce-cart:v1';

interface CartState {
  cart: Cart | null;
  /** Replace the cart with a server-confirmed value and mirror it to storage. */
  replace: (cart: NonNullable<CartState['cart']>) => void;
  /**
   * Empty the displayed cart and its storage mirror.
   *
   * Deliberately does NOT touch the WooCommerce session token: emptying the
   * cart (e.g. removing the last line item, or a completed order) must not
   * destroy the session, otherwise every subsequent request is session-less
   * and the cart can never be rebuilt. Session lifetime is owned by the Apollo
   * link (7-day expiry) — see ApolloClient.ts.
   */
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
        localStorage.removeItem(WOOCOMMERCE_CART_KEY);
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
);
