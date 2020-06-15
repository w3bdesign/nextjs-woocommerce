import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { GET_CART } from 'utils/const/GQL_QUERIES';
import { CHECKOUT_MUTATION } from 'utils/const/GQL_MUTATIONS';
import { INITIAL_STATE } from 'utils/const/INITIAL_STATE';

import { AppContext } from 'utils/context/AppContext';

import { getFormattedCart } from 'utils/functions/functions';

const CheckoutForm = () => {
  const [cart, setCart] = useContext(AppContext);
  const [input, setInput] = useState(INITIAL_STATE);
  const [orderData, setOrderData] = useState(null);
  const [requestError, setRequestError] = useState(null);

  // Checkout GraphQL mutation
  const [
    checkout,
    { data: checkoutResponse, loading: checkoutLoading, error: checkoutError },
  ] = useMutation(CHECKOUT_MUTATION, {
    variables: {
      input: orderData,
    },
    onCompleted: () => {
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

  /*
   * Handle form submit.
   *
   * @param {Object} event Event Object.
   *
   * @return {void}
   */
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const result = validateAndSanitizeCheckoutForm(input);
    if (!result.isValid) {
      setInput({ ...input, errors: result.errors });
      return;
    }
    const checkOutData = createCheckoutData(input);
    setOrderData(checkOutData);
    setRequestError(null);
  };

  useEffect(() => {
    if (null !== orderData) {
      // Perform checkout mutation when the value for orderData changes.
      checkout();
    }
  }, [orderData]);

  return (
    <>
      {cart ? (
        <form onSubmit={handleFormSubmit} className="woo-next-checkout-form">
          <div className="row">Skjema kommer her</div>
        </form>
      ) : (
        ''
      )}
    </>
  );
};

export default CheckoutForm;
