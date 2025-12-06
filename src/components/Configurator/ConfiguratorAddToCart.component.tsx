import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSnapshot } from 'valtio';

// Components
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Config
import { getModelFamily } from '@/config/families.registry';

// State
import { useCartStore } from '@/stores/cartStore';
import { configuratorState } from '@/stores/configuratorStore';

// Utils
import { debug } from '@/utils/debug';
import {
  getFormattedCart,
  serializeConfiguratorState,
} from '@/utils/functions/functions';
import { resolveVariantForDimensions } from '@/utils/variantResolver';

// GraphQL
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

interface ConfiguratorAddToCartProps {
  className?: string;
  fullWidth?: boolean;
}

/**
 * Add to Cart button for configured products
 * Serializes the current configurator state and attaches it to the cart item
 */
const ConfiguratorAddToCart = ({
  className = '',
  fullWidth = true,
}: ConfiguratorAddToCartProps) => {
  const snap = useSnapshot(configuratorState);
  const { syncWithWooCommerce, isLoading: isCartLoading } = useCartStore();
  const [requestError, setRequestError] = useState<boolean>(false);
  const { toast } = useToast();

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
      onError: (error) => {
        console.error('Add to cart error:', error);
        setRequestError(true);
        toast({
          title: 'Error',
          description:
            'Failed to add configured product to cart. Please try again.',
          variant: 'destructive',
        });
      },
    });

  // Handle mutation completion
  useEffect(() => {
    if (mutationData) {
      refetch();
      toast({
        title: 'Added to cart',
        description: 'Your configured product has been added to the cart.',
      });
      setRequestError(false);
    }
  }, [mutationData, refetch, toast]);

  const handleAddToCart = () => {
    // Validate productId is available
    if (!snap.productId) {
      toast({
        title: 'Configuration Error',
        description: 'Product information is missing. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    // Validate dimensions for family-based products
    if (snap.familyId) {
      const family = getModelFamily(snap.familyId);

      if (family) {
        const currentVariant = resolveVariantForDimensions(
          {
            width: snap.dimensions.width,
            height: snap.dimensions.height,
          },
          family,
        );

        if (!currentVariant) {
          debug.warn(
            `[Add to Cart] Dimension validation failed: width=${snap.dimensions.width}cm, height=${snap.dimensions.height}cm do not match any variant in family ${snap.familyId}`,
          );

          toast({
            title: 'Invalid Dimensions',
            description:
              'Please adjust dimensions to a valid size before adding to cart.',
            variant: 'destructive',
          });
          return;
        }

        if (process.env.NODE_ENV === 'development') {
          debug.log(
            `[Add to Cart] Dimension validation passed: matched variant ${currentVariant.id} (${currentVariant.displayName})`,
          );
        }
      }
    }

    // Serialize the configurator state
    const configurationData = serializeConfiguratorState(snap);

    // Prepare mutation input
    const productQueryInput = {
      clientMutationId: uuidv4(),
      productId: snap.productId,
      quantity: 1,
      extraData: configurationData,
    };

    // Execute mutation
    addToCart({
      variables: {
        input: productQueryInput,
      },
    });

    // Refetch cart after 2 seconds as backup
    setTimeout(() => {
      refetch();
    }, 2000);
  };

  const isLoading = addToCartLoading || isCartLoading;
  const isDisabled = isLoading || requestError || !snap.productId;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`${fullWidth ? 'w-full' : ''} bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 h-auto rounded-lg ${className}`}
    >
      {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
    </Button>
  );
};

export default ConfiguratorAddToCart;
