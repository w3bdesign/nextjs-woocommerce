import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

export interface Image {
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

export interface RootObject {
  products: Product[];
  totalProductsCount: number;
  totalProductsPrice: number;
}

interface CartState {
  cart: RootObject | null;
  isLoading: boolean;
  setCart: (cart: RootObject | null) => void;
  updateCart: (newCart: RootObject) => void;
}

type CartPersist = {
  cart: RootObject | null;
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      isLoading: true,
      setCart: (cart: RootObject | null) => set({ cart, isLoading: false }),
      updateCart: (newCart: RootObject) => {
        set({ cart: newCart });
      }
    }),
    {
      name: 'woocommerce-cart',
      partialize: (state) => ({ cart: state.cart }),
      version: 1
    } as PersistOptions<CartState, CartPersist>
  )
)

export default useCartStore;
