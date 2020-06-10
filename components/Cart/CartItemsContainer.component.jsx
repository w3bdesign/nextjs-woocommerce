import Link from 'next/link';
import { v4 } from 'uuid';
import { useContext, useState, useEffect } from 'react';

import { useQuery, useMutation } from '@apollo/client';

import { AppContext } from '../../utils/context/AppContext';
import {
  getFormattedCart,
  getUpdatedItems,
  removeItemFromCart,
} from '../../utils/functions/functions';

import CartItem from './CartItem.component';
import { WOO_CONFIG } from 'utils/config/nextConfig';

import { GET_CART } from '../../utils/const/GQL_QUERIES';

/*
import UPDATE_CART from "../../../mutations/update-cart";
import GET_CART from "../../../queries/get-cart";
import CLEAR_CART_MUTATION from "../../../mutations/clear-cart";
*/

const CartItemsContainer = () => {
  // TODO will use it in future variations of the project.
  const [cart, setCart] = useContext(AppContext);
  const [requestError, setRequestError] = useState(null);

  console.log("Cart from context: ");
  console.log(cart);

  const { loading, error, data, refetch } = useQuery(GET_CART, {
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);
      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));
      // Update cart data in React Context.
      setCart(updatedCart);
      console.warn( 'Completed GET_CART', data );
    },
    onError: (error) => {
      console.warn('Error fetching cart');
      setRequestError(error);
    },
  });
  // TODO We will focus on fetching the cart before we add more functionality

  return (
    <section className="py-8 bg-white">
      <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto">
        <nav id="store" className="top-0 w-full px-6 py-1">
          <div className="container flex flex-wrap items-center justify-between w-full px-2 py-3 mx-auto mt-0">
            <a
              className="mt-6 text-xl font-bold tracking-wide text-gray-800 no-underline uppercase hover:no-underline"
              href="#"
            >
              Handlekurv
            </a>
          </div>
        </nav>

        {data ? (
          <div className="p-6 mx-auto mt-5">
            <h2 className="text-lg">Vi har innhold i handlekurven!</h2>
          </div>
        ) : (
          <div className="p-6 mx-auto mt-5">
            <h2 className="text-lg">Ingen varer i handlekurven</h2>

            <button className="px-4 py-2 m-4 font-bold uppercase bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
              <Link href="/produkter">
                <a>Legg til varer</a>
              </Link>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartItemsContainer;
