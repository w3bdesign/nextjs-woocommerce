import { useState, useContext } from 'react';
import { request } from 'graphql-request';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { useQuery, useMutation } from '@apollo/react-hooks';

import { AppContext } from 'utils/context/AppContext';

import { GET_CART } from 'utils/const/GQL_QUERIES';
import { ADD_TO_CART } from 'utils/const/GQL_MUTATIONS';
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
  const [cart, setCart] = useContext(AppContext);
  const [requestError, setRequestError] = useState(null);
  const [showViewCart, setShowViewCart] = useState(false);

  const product = props.product;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId: product.productId,
  };

  // Get Cart Data.
  const { loading, error, data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      console.log('Data from add to cart button: ');
      console.log(data);
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);

      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));

      // Update cart data in React Context.
      setCart(updatedCart);
    },
  });

  const [
    addToCart,
    { data: addToCartRes, loading: addToCartLoading, error: addToCartError },
  ] = useMutation(ADD_TO_CART, {
    variables: {
      input: productQueryInput,
    },
    onCompleted: (data) => {
      // If error.
      if (addToCartError) {
        console.log('Add to cart error');
        //setRequestError(addToCartError.graphQLErrors[0].message);
      }
      // Update the cart with new values in React context.
      refetch();
      // Show View Cart Button
      setShowViewCart(true);
      console.warn('Completed ADD_TO_CART', data);
    },
    onError: (error) => {
      if (error) {
        console.log('Error inside add to cart');
        //setRequestError(error.graphQLErrors[0].message);
        console.log(error);
      }
    },
  });

  const handleAddToCartClick = () => {
    setRequestError(null);
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
