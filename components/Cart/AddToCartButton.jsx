import { useState, useContext } from 'react';

import { AppContext } from 'utils/context/AppContext';
import { addFirstProduct } from 'utils/functions/functions';

const AddToCartButton = (props) => {
  console.log('Add to cart button: ');
  console.log(props);

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

  const handleAddToCartClick = (props) => {

    // If component is rendered on the client side
    if (process.browser) {
      console.log('Is browser!');
      console.log(props);

      let existingCart = localStorage.getItem('woocommerce-cart');
      console.log('Existing cart');
      console.log(existingCart);
      if (existingCart) {
        console.log('Existing cart status:');
        console.log(cart);
      } else {
        const NewCart = addFirstProduct(props);
        setCart('testing cart');
        console.log('Cart status:');
        console.log(cart);
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
