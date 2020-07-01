import Link from 'next/link';
import { v4 } from 'uuid';
import { useContext, useState, useEffect } from 'react';

import { useQuery, useMutation } from '@apollo/react-hooks';

import { AppContext } from 'utils/context/AppContext';
import {
  getFormattedCart,
  getUpdatedItems,
  removeItemFromCart,
} from '../../../utils/functions/functions';

import PageTitle from 'components/Header/PageTitle.component';
import RegularCart from './RegularCart.component';
import MobileCart from './MobileCart.component';

import { GET_CART } from 'utils/const/GQL_QUERIES';

/*
import UPDATE_CART from "../../../mutations/update-cart";
import GET_CART from "../../../queries/get-cart";
import CLEAR_CART_MUTATION from "../../../mutations/clear-cart";
*/

const CartItemsContainer = () => {
  const [cart, setCart] = useContext(AppContext);
  const [requestError, setRequestError] = useState(null);

  const { loading, error, data, refetch } = useQuery(GET_CART, {
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);
      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));
      // Update cart data in React Context.
      setCart(updatedCart);
    },
    onError: (error) => {
      console.warn('Error fetching cart');
      setRequestError(error);
    },
  });
  // TODO Add more functionality

  return (
    <>
      <section className="py-8 bg-white">
        <div className="container flex flex-wrap items-center mx-auto">
          {cart ? (
            <div className="p-6 mx-auto mt-5">
              <PageTitle title="Handlekurv" />

              <RegularCart cart={cart} />
              <MobileCart cart={cart} />

              <div className="mt-4">
                <Link href="/kasse">
                  <button className="px-4 py-2 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
                    GÅ TIL KASSE
                  </button>
                </Link>
              </div>
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
    </>
  );
};

export default CartItemsContainer;
