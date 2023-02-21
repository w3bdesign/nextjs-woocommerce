// Imports
import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

// Components
import Button from '@/components/UI/Button.component';

// State
import { CartContext } from '@/utils/context/CartProvider';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';

/**
 * Handles the Add to cart functionality.
 * Uses GraphQL for product data
 * @param {Object} product // Product data
 */
const AddToCart = ({ product }: any) => {
  const [, setCart] = useContext<any>(CartContext);
  const [requestError, setRequestError] = useState<boolean>(false);

  const productId = product.databaseId ? product.databaseId : product;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId,
  };

  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    variables: {
      input: productQueryInput,
    },
    onCompleted: () => {
      // Update the cart with new values in React context.
      // refetch();
      // If error.
    },
    onError: () => {
      setRequestError(true);
    },
  });

  const handleAddToCart = () => {
    setCart(product);
    addToCart();
  };

  return (
    <>
      <Button
        handleButtonClick={() => handleAddToCart()}
        buttonDisabled={addToCartLoading || requestError}
      >
        KJØP
      </Button>
    </>
  );
};

export default AddToCart;
