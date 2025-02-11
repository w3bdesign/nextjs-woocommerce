import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

import Button from '@/components/UI/Button.component';
import useCartStore, { RootObject } from '@/stores/cart';

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
  const { setCart, isLoading: isCartLoading } = useCartStore();
  const [requestError, setRequestError] = useState<boolean>(false);

  const productId = product?.databaseId ? product?.databaseId : variationId;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId,
  };

  // Get cart data query
  useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      const updatedCart = getFormattedCart(data) as RootObject | undefined;
      setCart(updatedCart || null);
    },
  });

  // Add to cart mutation
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    variables: {
      input: productQueryInput,
    },
    refetchQueries: [{ query: GET_CART }],
    awaitRefetchQueries: true,
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
