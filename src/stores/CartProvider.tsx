import React, {
  useState,
  useEffect,
  createContext,
  useMemo,
} from 'react';

interface ICartProviderProps {
  children: React.ReactNode;
}

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

export interface RootObject {
  products: Product[];
  totalProductsCount: number;
  totalProductsPrice: number;
}

export type TRootObject = RootObject | string | null | undefined;

export type TRootObjectNull = RootObject | null | undefined;

interface ICartContext {
  cart: RootObject | null | undefined;
  setCart: React.Dispatch<React.SetStateAction<TRootObjectNull>>;
  updateCart: (newCart: RootObject) => void;
  isLoading: boolean;
}

const CartState: ICartContext = {
  cart: null,
  setCart: () => {},
  updateCart: () => {},
  isLoading: true,
};

export const CartContext = createContext<ICartContext>(CartState);

/**
 * Provides a global application context for the entire application with the cart contents
 */
export const CartProvider = ({ children }: ICartProviderProps) => {
  const [cart, setCart] = useState<RootObject | null>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we are client-side before we access the localStorage
    if (typeof window !== 'undefined') {
      const localCartData = localStorage.getItem('woocommerce-cart');
      if (localCartData) {
        const cartData: RootObject = JSON.parse(localCartData);
        setCart(cartData);
      }
      setIsLoading(false);
    }
  }, []);

  const updateCart = (newCart: RootObject) => {
    setCart(newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('woocommerce-cart', JSON.stringify(newCart));
    }
  };

  const contextValue = useMemo(() => {
    return { cart, setCart, updateCart, isLoading };
  }, [cart, isLoading]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
