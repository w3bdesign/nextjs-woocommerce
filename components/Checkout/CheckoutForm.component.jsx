import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { GET_CART } from 'utils/const/GQL_QUERIES';
import { AppContext } from 'utils/context/AppContext';

import {
  getFormattedCart,
  getUpdatedItems,
  removeItemFromCart,
} from 'utils/functions/functions';

const CheckoutForm = () => {
  const initialState = {
    firstName: 'Test',
    lastName: 'Test',
    address1: 'Test addresse',
    address2: 'Test addresse',
    city: 'Oslo',
    state: 'Oslo',
    country: 'NO',
    postcode: '1525',
    phone: '90561212',
    email: 'test@gmail.com',
    company: 'Tech',
    createAccount: false,
    orderNotes: '',
    paymentMethod: 'cod',
    errors: null,
  };

  // Get Cart Data.
  const { loading, error, data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);
      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));
      // Update cart data in React Context.
      setCart(updatedCart);
    },
  });

  useEffect(() => {
    if (null !== orderData) {
      // Call the checkout mutation when the value for orderData changes/updates.
      // checkout();
    }
  }, [orderData]);

  const [cart, setCart] = useContext(AppContext);
  const [input, setInput] = useState(initialState);
  const [orderData, setOrderData] = useState(null);
  const [requestError, setRequestError] = useState(null);
  return (
    <>
      <section className="py-8 bg-white">
        <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto">
          <nav id="store" className="top-0 w-full px-6 py-1">
            <div className="container flex flex-wrap items-center justify-between w-full px-2 py-3 mx-auto mt-0">
              <a
                className="mt-6 text-xl font-bold tracking-wide text-gray-800 no-underline uppercase hover:no-underline"
                href="#"
              >
                Bestillingsskjema
              </a>
            </div>
          </nav>
        </div>
      </section>
    </>
  );
};

export default CheckoutForm;
