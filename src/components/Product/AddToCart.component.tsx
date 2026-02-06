// Imports
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

// Components
import Button from '@/components/UI/Button.component';

// State
import { useCartStore } from '@/stores/cartStore';

// Utils
import { getFormattedCart } from '@/utils/functions/functions';

// Types
import type {
  ISingleProduct,
  ISingleProductProps,
  IVariationDetail,
} from '@/types/product';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';

// Re-export types for backward compatibility
export type IProduct = ISingleProduct;
export type IProductRootObject = ISingleProductProps;
export type IVariationNodes = IVariationDetail;

/**
 * Handles the Add to cart functionality.
 * Uses GraphQL for product data
 * @param {ISingleProductProps} product // Product data
 * @param {number} variationId // Variation ID
 * @param {boolean} fullWidth // Whether the button should be full-width
 */

const AddToCart = ({
  product,
  variationId,
  fullWidth = false,
}: ISingleProductProps) => {
  const { syncWithWooCommerce, isLoading: isCartLoading } = useCartStore();
  const [requestError, setRequestError] = useState<boolean>(false);

  const productId = product?.databaseId ? product?.databaseId : variationId;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId,
  };

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      const updatedCart = getFormattedCart(data);
      if (updatedCart) {
        syncWithWooCommerce(updatedCart);
      }
    },
  });

  // Add to cart mutation
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    variables: {
      input: productQueryInput,
    },
    refetchQueries: [{ query: GET_CART }],
    onCompleted: () => {
      // Delayed refetch to ensure WooCommerce backend has settled
      setTimeout(() => {
        refetch();
      }, 2000);
    },

    onError: () => {
      setRequestError(true);
    },
  });

  const handleAddToCart = () => {
    addToCart();
  };

  return (
    <>
      <Button
        handleButtonClick={() => handleAddToCart()}
        buttonDisabled={addToCartLoading || requestError || isCartLoading}
        fullWidth={fullWidth}
      >
        {isCartLoading ? 'Loading...' : 'KJØP'}
      </Button>
    </>
  );
};

export default AddToCart;
