import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  ReactPortal,
} from 'react';

interface ICartProviderProps {
  children:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | ReactPortal
    | null
    | undefined;
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

interface ICartContext {
  cartData: {
    cart: RootObject | null | undefined;
    setCart: React.Dispatch<
      React.SetStateAction<RootObject | null | undefined>
    >;
  };
}

export interface ICart {
  cart: RootObject | null | undefined;
  setCart: React.Dispatch<React.SetStateAction<RootObject | null | undefined>>;
}

export type TRootObject = RootObject | string | null | undefined;

const CartState = {
  cartData: { cart: null, setCart: () => {} },
};

export const CartContext = createContext<ICartContext>(CartState);

/**
 * Provides a global application context for the entire application with the cart contents

 */
export const CartProvider = ({ children }: ICartProviderProps) => {
  const [cart, setCart] = useState<RootObject | null>();

  const cartData = useMemo(
    () => ({
      cart,
      setCart,
    }),
    [cart]
  );

  useEffect(() => {
    // Check if we are client-side before we access the localStorage
    if (!process.browser) {
      return;
    }
    const localCartData = localStorage.getItem('woocommerce-cart');

    if (localCartData) {
      const cartData: RootObject = JSON.parse(localCartData);
      setCart(cartData);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartData }}>{children}</CartContext.Provider>
  );
};
