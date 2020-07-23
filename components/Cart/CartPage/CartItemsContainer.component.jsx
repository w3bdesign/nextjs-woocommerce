import Link from 'next/link';
import { v4 } from 'uuid';
import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { AppContext } from 'utils/context/AppContext';
import {
  getFormattedCart,
  getUpdatedItems,
} from '../../../utils/functions/functions';

import PageTitle from 'components/Title/PageTitle.component';
import RegularCart from './RegularCart.component';
import MobileCart from './MobileCart.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { GET_CART } from 'utils/const/GQL_QUERIES';
import { UPDATE_CART } from 'utils/const/GQL_MUTATIONS';

const CartItemsContainer = () => {
  const [cart, setCart] = useContext(AppContext);
  const [requestError, setRequestError] = useState(null);

  // Update Cart Mutation.
  const [
    updateCart,
    {
      data: updateCartResponse,
      loading: updateCartProcessing,
      error: updateCartError,
    },
  ] = useMutation(UPDATE_CART, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      if (error) {
        setRequestError(error);
      }
    },
  });

  /*
   * Handle remove product click.
   *
   * @param {Object} event event
   * @param {Integer} Product Id.
   *
   * @return {void}
   */
  const handleRemoveProductClick = (event, cartKey, products) => {
    event.stopPropagation();
    if (products.length) {
      // By passing the newQty to 0 in updateCart Mutation, it will remove the item.
      const newQty = 0;
      const updatedItems = getUpdatedItems(products, newQty, cartKey);

      updateCart({
        variables: {
          input: {
            clientMutationId: v4(),
            items: updatedItems,
          },
        },
      });
    }
  };

  const { loading, error, data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);
      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));
      // Update cart data in React Context.
      setCart(updatedCart);
    },
    onError: (error) => {     
      setRequestError(error);
    },
  });
  return (
    <>
      <section className="py-8 bg-white">
        <div className="container flex flex-wrap items-center mx-auto">
          {cart ? (
            <div className="p-6 mx-auto mt-5">
              <PageTitle title="Handlekurv" />
              <RegularCart
                cart={cart}
                updateCartProcessing={updateCartProcessing}
                handleRemoveProductClick={handleRemoveProductClick}
                updateCart={updateCart}
              />
              <MobileCart
                cart={cart}
                updateCartProcessing={updateCartProcessing}
                handleRemoveProductClick={handleRemoveProductClick}
                updateCart={updateCart}
              />
              <div className="mt-4">
                <Link href="/kasse">
                  <button className="px-4 py-2 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
                    GÅ TIL KASSE
                  </button>
                </Link>
              </div>
              {updateCartProcessing && (
                <>
                  <div className="mt-4 text-xl text-center">
                    Oppdaterer antall, vennligst vent ...
                    <br />
                  </div>
                  <div>
                    <LoadingSpinner />
                  </div>
                </>
              )}
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
