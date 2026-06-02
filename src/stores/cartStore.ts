import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Cart } from '@/types/cart';

export type { Cart } from '@/types/cart';

// Versioned localStorage keys to prevent crashes on schema changes
const WOOCOMMERCE_CART_KEY = 'woocommerce-cart:v1';
const WOO_SESSION_KEY = 'woo-session:v1';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  setCart: (cart: CartState['cart']) => void;
  updateCart: (newCart: NonNullable<CartState['cart']>) => void;
  syncWithWooCommerce: (cart: NonNullable<CartState['cart']>) => void;
  clearWooCommerceSession: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      isLoading: false,
      setCart: (cart) => set({ cart }),
      updateCart: (newCart) => {
        set({ cart: newCart });
        // Sync with WooCommerce
        localStorage.setItem(WOOCOMMERCE_CART_KEY, JSON.stringify(newCart));
      },
      syncWithWooCommerce: (cart) => {
        set({ cart });
        localStorage.setItem(WOOCOMMERCE_CART_KEY, JSON.stringify(cart));
      },
      clearWooCommerceSession: () => {
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
