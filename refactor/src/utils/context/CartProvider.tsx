import {
  useState,
  useEffect,
  createContext,
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  ReactPortal,
} from 'react';

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
  totalPrice: string;
  image: Image;
}

type TCart = string | Product | undefined | null | Record<string | never>;

interface ICartContext {
  cart: string | null | undefined | Product;
  setCart: React.Dispatch<React.SetStateAction<TCart>>;
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

const CartState = {
  cart: null,
  setCart: () => {},
};

export const CartContext = createContext<ICartContext>(CartState);

/**
 * Provides a global application context for the entire application with the cart contents

 */
export const CartProvider = ({ children }: ICartProviderProps) => {
  const [cart, setCart] = useState<TCart>();

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
