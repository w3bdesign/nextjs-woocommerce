// Imports
import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

// Components
import Button from '@/components/UI/Button.component';

// State
import { CartContext } from '@/utils/context/CartProvider';

// Utils
import { getFormattedCart } from '@/utils/functions/tfunctions';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';

export interface MyImage {
  __typename: string;
  id: string;
  sourceUrl?: string;
  srcSet?: string;
  altText: string;
  title: string;
}

export interface GalleryImages {
  __typename: string;
  nodes: any[];
}

export interface Node {
  __typename: string;
  id: string;
  databaseId: number;
  name: string;
  description: string;
  type: string;
  onSale: boolean;
  slug: string;
  averageRating: number;
  reviewCount: number;
  image: MyImage;
  galleryImages: GalleryImages;
  productId: number;
}

export interface MyProduct {
  __typename: string;
  node: Node;
}

export interface testRootObject {
  __typename: string;
  key: string;
  product: MyProduct;
  variation?: any;
  quantity: number;
  total: string;
  subtotal: string;
  subtotalTax: string;
}

/**
 * Handles the Add to cart functionality.
 * Uses GraphQL for product data
 * @param {Object} product // Product data
 */
const AddToCart = ({ product }: any) => {
  const { setCart } = useContext(CartContext);
  const [requestError, setRequestError] = useState<boolean>(false);

  const productId = product.databaseId;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId,
  };

  // Get cart data query

  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);

      if (!updatedCart) {
        return;
      }

      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));

      // Update cart data in React Context.
      setCart(updatedCart);
    },
  });

  // Add to cart mutation
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    variables: {
      input: productQueryInput,
    },

    onCompleted: () => {
      // Update the cart with new values in React context.
      refetch();
    },

    onError: () => {
      setRequestError(true);
    },
  });

  const handleAddToCart = () => {
    addToCart();
    // Refetch cart after 2 seconds
    setTimeout(() => {
      refetch();
    }, 2000);
  };

  return (
    <Button
      handleButtonClick={() => handleAddToCart()}
      buttonDisabled={addToCartLoading || requestError}
    >
      KJØP
    </Button>
  );
};

export default AddToCart;
