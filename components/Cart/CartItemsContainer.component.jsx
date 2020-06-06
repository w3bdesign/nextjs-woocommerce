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
          <p>Vi har innhold i handlekurven!</p>
        ) : (
          <div className="container mt-5">
            <h2>Ingen varer i handlekurven</h2>
            <Link href="/">
              <button className="btn btn-secondary woo-next-large-black-btn">
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
