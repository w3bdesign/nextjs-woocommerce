import Link from 'next/link';
import { v4 } from 'uuid';
import { useContext, useState, useEffect } from 'react';

// import { useMutation, useQuery } from "@apollo/react-hooks";
import { request } from 'graphql-request';
import useSWR from 'swr';

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

  const onSuccess = (cartData) => {
	console.log('Success from cart!');
	console.log(cartData);
  };

  const onError = (errorMessage) => {
    console.log('Error from cart!');
    console.log(errorMessage);
  };

  const { data, error } = useSWR(
    GET_CART,
    (query) => request(WOO_CONFIG.GRAPHQL_URL, query),
    { refreshInterval: 3600000, onSuccess, onError }
  ); // Refresh once every hour


  // Get Cart Data.

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

        {cart ? (
          <div className="mt-5">
            <h2>Vi har innhold i handlekurven!</h2>
          </div>
        ) : (
          <div className="container mt-5">
            <h2>Ingen varer i handlekurven</h2>
            <Link href="/">
              <button className="px-4 py-2 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
                <span className="woo-next-cart-checkout-txt">
                  Legg til varer
                </span>
                <i className="fas fa-long-arrow-alt-right" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartItemsContainer;
