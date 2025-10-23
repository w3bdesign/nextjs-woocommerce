// Imports
import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Components
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// State
import { useCartStore } from '@/stores/cartStore';

// Utils
import { getFormattedCart } from '@/utils/functions/functions';

// GraphQL
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

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
  /** Optional: 3D Configurator metadata */
  configurator?: {
    enabled: boolean;
    modelId: string;
    customPricing?: Record<string, number>;
    defaultConfiguration?: Record<string, string>;
  };
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
  const { syncWithWooCommerce, isLoading: isCartLoading } = useCartStore();
  const [requestError, setRequestError] = useState<boolean>(false);
  const { toast } = useToast();

  const productId = product?.databaseId ? product?.databaseId : variationId;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId,
  };

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (!data) return;
    const updatedCart = getFormattedCart(data as any);
    if (updatedCart) {
      syncWithWooCommerce(updatedCart);
    }
  }, [data, syncWithWooCommerce]);

  // Add to cart mutation
  const [addToCart, { loading: addToCartLoading, data: mutationData }] =
    useMutation(ADD_TO_CART, {
      variables: {
        input: productQueryInput,
      },

      onError: () => {
        setRequestError(true);
        toast({
          title: 'Error',
          description: 'Failed to add product to cart. Please try again.',
          variant: 'destructive',
        });
      },
    });

  // Handle mutation completion with useEffect instead of deprecated onCompleted
  useEffect(() => {
    if (mutationData) {
      // Update the cart with new values in React context.
      refetch();
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
    }
  }, [mutationData, refetch, product.name, toast]);

  const handleAddToCart = () => {
    addToCart();
    // Refetch cart after 2 seconds
    setTimeout(() => {
      refetch();
    }, 2000);
  };

  return (
    <>
      <Button
        onClick={() => handleAddToCart()}
        disabled={addToCartLoading || requestError || isCartLoading}
        className={fullWidth ? 'w-full md:w-auto' : ''}
      >
        {isCartLoading ? 'Loading...' : 'BUY'}
      </Button>
    </>
  );
};

export default AddToCart;
