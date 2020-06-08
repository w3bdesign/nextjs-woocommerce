import { useState, useContext } from 'react';
import { request } from 'graphql-request';
import useSWR from 'swr';

import { useQuery, useMutation } from "@apollo/client";


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
const AddToCartButton = (product) => {
  const [cart, setCart] = useContext(AppContext);
  const [requestError, setRequestError] = useState(null);

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


  // https://gist.github.com/yusinto/d8506184efb73b7214be9beaa4d150c1





  const [ addToCart, { data: addToCartRes, loading: addToCartLoading, error: addToCartError }] = useMutation( ADD_TO_CART, {
		variables: {
			input: product,
		},
		onCompleted: () => {
			 console.warn( 'completed ADD_TO_CART' );

			// If error.
			if ( addToCartError ) {
				setRequestError( addToCartError.graphQLErrors[ 0 ].message );
			}

			// On Success:
			// 1. Make the GET_CART query to update the cart with new values in React context.
			refetch();

			// 2. Show View Cart Button
			setShowViewCart( true )
		},
		onError: ( error ) => {
			if ( error ) {
				setRequestError( error.graphQLErrors[ 0 ].message );
			}
		}
	} );









  /*
  const addToCart = (product) => {
    
    console.log('Add to cart triggered: ');
    console.log(product);

    const { data, error } = useSWR(
      ADD_TO_CART,
      (query) => request(WOO_CONFIG.GRAPHQL_URL, query),
      {
        refreshInterval: 1000,
        onSuccess: (cartData) => {
          console.log('Success add to cart!!!!');
        },
        onError: (errorMessage) => {
          console.log('Error from add to cart: ');
          console.log(errorMessage);
        },
      }
    );
  };
  */

  const handleAddToCartClick = (product) => {
    setRequestError(null);
    addToCart(product);
  };

  return (
    <>
      <button
        onClick={() => handleAddToCartClick(product)}
        className="px-4 py-2 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400"
      >
        KJØP
      </button>
    </>
  );
};

export default AddToCartButton;
