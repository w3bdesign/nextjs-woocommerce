// Imports
import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';

// Components
import Billing from './Billing.component';
import CartContents from '../Cart/CartContents.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { CHECKOUT_MUTATION } from '@/utils/gql/GQL_MUTATIONS';
import { CartContext } from '@/utils/context/CartProvider';

// Utils
import {
  getFormattedCart,
  createCheckoutData,
  ICheckoutDataProps,
} from '@/utils/functions/functions';

const CheckoutForm = () => {
  const { cart, setCart } = useContext(CartContext);
  const [orderData, setOrderData] = useState<any>(null);
  const [requestError, setRequestError] = useState<any>(null);
  const [orderCompleted, setorderCompleted] = useState(false);

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);

      if (!updatedCart) {
        return;
      }

      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));

      // Update cart data in React Context.
      setCart(updatedCart);
    },
  });

  // Checkout GraphQL mutation
  const [checkout, { loading: checkoutLoading }] = useMutation(
    CHECKOUT_MUTATION,
    {
      variables: {
        input: orderData,
      },
      onCompleted: () => {
        localStorage.removeItem('woo-session');
        localStorage.removeItem('wooocommerce-cart');
        setorderCompleted(true);

        refetch();
      },
      onError: (error) => {
        setRequestError(error);
        refetch();
      },
    }
  );

  useEffect(() => {
    if (null !== orderData) {
      // Perform checkout mutation when the value for orderData changes.
      checkout();
    }
  }, [checkout, orderData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const onSubmit = (submitData: ICheckoutDataProps) => {
    const checkOutData = createCheckoutData(submitData);
    setOrderData(checkOutData);
    setRequestError(null);
  };

  return (
    <>
      {cart && !orderCompleted ? (
        <div className="container mx-auto">
          {/*	Order*/}
          <CartContents />
          {/*Payment Details*/}
          <Billing onSubmit={onSubmit} />
          {/*Error display*/}
          {requestError && (
            <div className="h-32 text-xl text-center text-red-600">
              En feil har oppstått.
            </div>
          )}
          {/* Checkout Loading*/}
          {checkoutLoading && (
            <div className="text-xl text-center">
              Behandler ordre, vennligst vent ...
              <LoadingSpinner />
            </div>
          )}
        </div>
      ) : (
        <>
          {orderCompleted && (
            <div className="container h-24 m-12 mx-auto mt-32 text-xl text-center">
              Takk for din ordre!
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CheckoutForm;
