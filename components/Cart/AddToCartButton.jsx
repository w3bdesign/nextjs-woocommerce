import { useState, useContext } from 'react';

import { AppContext } from 'utils/context/AppContext';
import { addFirstProduct } from 'utils/functions/functions';

/**
 * Display and process product object when we click on the Add To Cart button
 * Adds product to shopping cart
 * @param {Object} props
 */
const AddToCartButton = (props) => {
  const { product } = props;
  const [cart, setCart] = useContext(AppContext);

  const {
    description,
    image,
    name,
    onSale,
    productId,
    price,
    regularPrice,
    salePrice,
  } = props.product.products.edges[0].node;

  const handleAddToCartClick = () => {
    // If component is rendered on the client side
    if (process.browser) {
      let existingCart = localStorage.getItem('woocommerce-cart');
      if (existingCart) {
        console.log('We have an existing product in cart: ');
        console.log(cart);
      } else {
        const NewCart = addFirstProduct(props);
        setCart(NewCart);
      }
    }
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
