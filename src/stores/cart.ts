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
  updateProductQuantity: (cartKey: string, newQty: number) => void;
  removeProduct: (cartKey: string) => void;
}

type CartPersist = {
  cart: RootObject | null;
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
  cart: null,
  isLoading: false, // Start with false since we'll show persisted data immediately
  setCart: (cart: RootObject | null) => set({ cart, isLoading: false }),
  updateCart: (newCart: RootObject) => {
    set({ cart: newCart });
  },
  removeProduct: (cartKey: string) => {
    set((state) => {
      if (!state.cart) return state;

      const updatedProducts = state.cart.products.filter(p => p.cartKey !== cartKey);
      const totalCount = updatedProducts.reduce((sum, product) => sum + product.qty, 0);

      return {
        ...state,
        cart: {
          ...state.cart,
          products: updatedProducts,
          totalProductsCount: totalCount
        }
      };
    });
  },
  updateProductQuantity: (cartKey: string, newQty: number) => {
    set((state) => {
      if (!state.cart) return state;

      const products = state.cart.products.map(product => 
        product.cartKey === cartKey 
          ? { ...product, qty: newQty }
          : product
      );

      const totalCount = products.reduce((sum, product) => sum + product.qty, 0);

      return {
        ...state,
        cart: {
          ...state.cart,
          products,
          totalProductsCount: totalCount
        }
      };
    });
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
