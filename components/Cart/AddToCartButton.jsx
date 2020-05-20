import { Link } from 'next/link';

const AddToCartButton = (props) => {
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
      } else {
        //const NewCart = addFirstProduct(props)
      }
    }
  };

  return (
    <>
      <button
        onClick={handleAddToCartClick()}
        className="px-4 py-2 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400"
      >
        KJØP
      </button>
    </>
  );
};

export default AddToCartButton;
