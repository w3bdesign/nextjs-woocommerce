import { useState, useContext } from 'react';
import { request } from 'graphql-request';
import useSWR from 'swr';

import { AppContext } from 'utils/context/AppContext';

import { GET_CART } from 'utils/const/GQL_QUERIES';
import { WOO_CONFIG } from 'utils/config/nextConfig';

import {
  getFormattedCart,
  getUpdatedItems,
  removeItemFromCart,
} from 'utils/functions/functions';


import { addFirstProduct } from 'utils/functions/functions';
import { updateCart } from 'utils/functions/functions';

/**
 * Display and process product object when we click on the Add To Cart button
 * Adds product to shopping cart
 * @param {Object} props
 */
const AddToCartButton = (props) => {
  const { product } = props;
  const [cart, setCart] = useContext(AppContext);
  const [ requestError, setRequestError ] = useState( null );

  //const [ addToCart, { data: addToCartRes, loading: addToCartLoading, error: addToCartError }] = useMutation( ADD_TO_CART, {

  const { data, error } = useSWR(
    GET_CART,
    (query) => request(WOO_CONFIG.GRAPHQL_URL, query),
    {
      refreshInterval: 1000,
      onSuccess: (cartData) => {
        const updatedCart = getFormattedCart(cartData);
        localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));
        // Update cart data in React Context.
        setCart(updatedCart);
      },
      onError: (errorMessage) => {
        console.log('Error from cart: ');
        console.log(errorMessage);
      },
    }
  ); // Refresh once every minute

  const handleAddToCartClick = () => {		
		setRequestError( null );
		addToCart();
	};

  return (
    <>
      <button
        onClick={() => handleAddToCartClick()}
        className="px-4 py-2 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400"
      >
        KJØP
      </button>
    </>
  );
};

export default AddToCartButton;
