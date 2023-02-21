import {
  useState,
  useEffect,
  createContext,
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  ReactPortal,
} from 'react';

interface ICartContext {
  cart: string | null | undefined | TRootObject;
  setCart: React.Dispatch<
    React.SetStateAction<string | null | undefined | TRootObject>
  >;
}
[];

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
  sourceUrl: string;
  srcSet: string;
  title: string;
}

interface Product {
  cartKey: string;
  name: string;
  qty: number;
  price: number;
  //totalPrice: string;
  totalPrice: number;
  image: Image;
}

export interface RootObject {
  products: Product[];
  totalProductsCount: number;
  totalProductsPrice: string;
}

type TRootObject = RootObject | string | null | undefined;

const CartState = {
  cart: null,
  setCart: () => {},
};

export const CartContext = createContext<ICartContext>(CartState);

/**
 * Provides a global application context for the entire application with the cart contents

 */
export const CartProvider = ({ children }: ICartProviderProps) => {
  const [cart, setCart] = useState<string | null | undefined | TRootObject>();

  useEffect(() => {
    // Check if we are client-side before we access the localStorage
    if (!process.browser) {
      return;
    }
    let cartData = localStorage.getItem('woocommerce-cart');
    cartData = null !== cartData ? JSON.parse(cartData) : '';

    setCart(cartData);
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};
