// Imports
import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

// Components
import Button from '@/components/UI/Button.component';

// State
import { CartContext } from '@/stores/CartProvider';

// Utils
import { getFormattedCart } from '@/utils/functions/functions';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';

interface IImage {
  __typename: string;
  id: string;
  uri: string;
  title: string;
  srcSet: string;
  sourceUrl: string;
}

interface IVariationNode {
  __typename: string;
  name: string;
}

interface IAllPaColors {
  __typename: string;
  nodes: IVariationNode[];
}

interface IAllPaSizes {
  __typename: string;
  nodes: IVariationNode[];
}

export interface IVariationNodes {
  __typename: string;
  id: string;
  databaseId: number;
  name: string;
  stockStatus: string;
  stockQuantity: number;
  purchasable: boolean;
  onSale: boolean;
  salePrice?: string;
  regularPrice: string;
}

interface IVariations {
  __typename: string;
  nodes: IVariationNodes[];
}

export interface IProduct {
  __typename: string;
  id: string;
  databaseId: number;
  averageRating: number;
  slug: string;
  description: string;
  onSale: boolean;
  image: IImage;
  name: string;
  salePrice?: string;
  regularPrice: string;
  price: string;
  stockQuantity: number;
  allPaColors?: IAllPaColors;
  allPaSizes?: IAllPaSizes;
  variations?: IVariations;
}

export interface IProductRootObject {
  product: IProduct;
  variationId?: number;
  fullWidth?: boolean;
}

/**
 * Handles the Add to cart functionality.
 * Uses GraphQL for product data
 * @param {IAddToCartProps} product // Product data
 * @param {number} variationId // Variation ID
 * @param {boolean} fullWidth // Whether the button should be full-width
 */

const AddToCart = ({
  product,
  variationId,
  fullWidth = false,
}: IProductRootObject) => {
  const { updateCart } = useContext(CartContext);
  const [requestError, setRequestError] = useState<boolean>(false);

  const productId = product?.databaseId ? product?.databaseId : variationId;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId,
  };

  // Get cart data query
  const { refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      // Update cart in the localStorage and React Context.
      const updatedCart = getFormattedCart(data);
      if (updatedCart) {
        updateCart(updatedCart);
      }
    },
  });

  // Add to cart mutation
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    variables: {
      input: productQueryInput,
    },
    onCompleted: (data) => {
      // Immediately update the cart with new values
      const updatedCart = getFormattedCart(data);
      if (updatedCart) {
        updateCart(updatedCart);
      }
    },
    onError: () => {
      setRequestError(true);
    },
  });

  const handleAddToCart = async () => {
    try {
      await addToCart();
      // Refetch cart immediately after adding to cart
      await refetch();
    } catch (error) {
      console.error('Error adding to cart:', error);
      setRequestError(true);
    }
  };

  return (
    <>
      <Button
        handleButtonClick={handleAddToCart}
        buttonDisabled={addToCartLoading || requestError}
        fullWidth={fullWidth}
      >
        KJØP
      </Button>
    </>
  );
};

export default AddToCart;
