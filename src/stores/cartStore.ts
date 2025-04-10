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
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      isLoading: false,
      setCart: (cart) => set({ cart }),
      updateCart: (newCart) => set({ cart: newCart }),
    }),
    {
      name: 'woocommerce-cart',
      // Only persist the cart data, not the loading state
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
