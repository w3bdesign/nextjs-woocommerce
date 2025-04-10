import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Image {
  sourceUrl?: string;
  srcSet?: string;
  title: string;
}

export interface Product {
  cartKey: string;
  name: string;
  qty: number;
  price: number;
  totalPrice: string;
  image: Image;
  productId: number;
}

interface CartState {
  cart: {
    products: Product[];
    totalProductsCount: number;
    totalProductsPrice: number;
  } | null;
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
        localStorage.setItem('woocommerce-cart', JSON.stringify(newCart));
      },
      syncWithWooCommerce: (cart) => {
        set({ cart });
        localStorage.setItem('woocommerce-cart', JSON.stringify(cart));
      },
      clearWooCommerceSession: () => {
        set({ cart: null });
        localStorage.removeItem('woo-session');
        localStorage.removeItem('woocommerce-cart');
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
);
