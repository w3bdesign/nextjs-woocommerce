// Imports
import { useState } from 'react';
import { useMutation, ApolloError } from '@apollo/client';

// Components
import Billing from './Billing.component';
import CartContents from '../Cart/CartContents.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

// Cart module
import { useCart } from '@/hooks/useCart';

// GraphQL
import { CHECKOUT_MUTATION } from '@/utils/gql/GQL_MUTATIONS';

// Utils
import { createCheckoutData } from '@/utils/functions/functions';

// Types
import type { ICheckoutDataProps } from '@/types/checkout';

const CheckoutForm = () => {
  const { cart, isLoading, refetchCart, clearCart } = useCart();
  const [requestError, setRequestError] = useState<ApolloError | null>(null);
  const [orderCompleted, setorderCompleted] = useState<boolean>(false);

  // Checkout GraphQL mutation
  const [checkout, { loading: checkoutLoading }] = useMutation(
    CHECKOUT_MUTATION,
    {
      onCompleted: () => {
        setorderCompleted(true);
        // The order emptied the server cart out-of-band. A refetch would be
        // ignored by the populate-only query path, so clear explicitly.
        clearCart();
      },
      onError: (error) => {
        setRequestError(error);
        refetchCart();
      },
    },
  );

  const handleFormSubmit = (submitData: ICheckoutDataProps) => {
    const checkOutData = createCheckoutData(submitData);
    setRequestError(null);
    checkout({
      variables: {
        input: checkOutData,
      },
    });
  };

  return (
    <>
      {cart && !orderCompleted ? (
        <div className="container mx-auto">
          {/*	Order*/}
          <CartContents />
          {/*Payment Details*/}
          <Billing handleFormSubmit={handleFormSubmit} />
          {/*Error display*/}
          {requestError && (
            <div className="h-32 text-xl text-center text-error" role="alert">
              En feil har oppstått.
            </div>
          )}
          {/* Checkout Loading*/}
          {checkoutLoading && (
            <div className="text-xl text-center text-text">
              Behandler ordre, vennligst vent ...
              <LoadingSpinner />
            </div>
          )}
        </div>
      ) : (
        <>
          {!cart && !orderCompleted && !isLoading && (
            <h1 className="text-2xl m-12 mt-24 font-semibold text-center text-text">
              Ingen produkter i handlekurven
            </h1>
          )}
          {orderCompleted && (
            <div className="container h-24 m-12 mx-auto mt-24 text-xl text-center text-primary">
              Takk for din ordre!
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CheckoutForm;
