import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { GET_CART } from 'utils/const/GQL_QUERIES';
import { INITIAL_STATE } from 'utils/const/INITIAL_STATE';
import { AppContext } from 'utils/context/AppContext';

import { getFormattedCart } from 'utils/functions/functions';

const CheckoutForm = () => {
  const [cart, setCart] = useContext(AppContext);
  const [input, setInput] = useState(INITIAL_STATE);
  const [orderData, setOrderData] = useState(null);
  const [requestError, setRequestError] = useState(null);

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
      // Do checkout mutation when the value for orderData changes.
      // checkout();
    }
  }, [orderData]);

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
