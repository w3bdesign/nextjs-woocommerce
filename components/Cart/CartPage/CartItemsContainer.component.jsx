import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { AppContext } from 'utils/context/AppContext';
import { getFormattedCart, getUpdatedItems } from 'utils/functions/functions';

import RegularCart from './RegularCart.component';
import MobileCart from './MobileCart.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { GET_CART } from 'utils/gql/GQL_QUERIES';
import { UPDATE_CART } from 'utils/gql/GQL_MUTATIONS';

const CartItemsContainer = () => {
  const [cart, setCart] = useContext(AppContext);
  const [requestError, setRequestError] = useState(null);

  const { data, refetch } = useQuery(GET_CART, {
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

  // Update Cart Mutation.
  const [updateCart, { loading: updateCartProcessing }] = useMutation(
    UPDATE_CART,
    {
      onCompleted: () => {
        refetch();
      },
      onError: (error) => {
        if (error) {
          setRequestError(error);
        }
      },
    }
  );

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
            clientMutationId: uuidv4(),
            items: updatedItems,
          },
        },
      });
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <section className="py-8 bg-white">
      <div className="container flex flex-wrap items-center mx-auto">
        {requestError && <div className="p-6 mx-auto mt-5">Error ... </div>}
        {cart ? (
          <div className="p-6 mx-auto mt-5">
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
              <Link href="/kasse" passHref>
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
  );
};

export default CartItemsContainer;
