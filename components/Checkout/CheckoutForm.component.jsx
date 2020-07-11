import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';

import Billing from './Billing.component';
import OrderDetails from './OrderDetails.component';
import MobileOrderDetails from './MobileOrderDetails.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
//import Payment from './Payment.component';

import { GET_CART } from 'utils/const/GQL_QUERIES';
import { CHECKOUT_MUTATION } from 'utils/const/GQL_MUTATIONS';

import { AppContext } from 'utils/context/AppContext';

import {
  getFormattedCart,
  createCheckoutData,
} from 'utils/functions/functions';

const CheckoutForm = () => {
  const [cart, setCart] = useContext(AppContext);

  const [orderData, setOrderData] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [orderCompleted, setorderCompleted] = useState(false);

  // Checkout GraphQL mutation
  const [
    checkout,
    { data: checkoutResponse, loading: checkoutLoading, error: checkoutError },
  ] = useMutation(CHECKOUT_MUTATION, {
    variables: {
      input: orderData,
    },
    onCompleted: () => {
      setorderCompleted(true);
      refetch();
    },
    onError: (error) => {
      if (error) {
        setRequestError(error);
      }
    },
  });

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
      // Perform checkout mutation when the value for orderData changes.
      checkout();
    }
  }, [orderData]);

  const onSubmit = (data) => {
    const checkOutData = createCheckoutData(data);
    setOrderData(checkOutData);
    setRequestError(null);
  };

  return (
    <>
      {cart ? (
        <div className="container mx-auto">
          {/*	Order*/}
          <OrderDetails cart={cart} />
          <MobileOrderDetails cart={cart} />

          {/*Payment Details*/}
          <Billing onSubmit={onSubmit} />

          {/* Checkout Loading*/}
          {checkoutLoading && (
            <div className="text-xl text-center">
              Behandler ordre, vennligst vent ...
              <br />
              <LoadingSpinner />
            </div>
          )}
          {requestError}
        </div>
      ) : (
        <>
          {orderCompleted && (
            <div className="container m-12 mx-auto text-xl text-center">
              Takk for din ordre!
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CheckoutForm;
