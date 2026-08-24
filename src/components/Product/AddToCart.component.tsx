// Components
import Button from '@/components/UI/Button.component';

// Cart module
import { useCart } from '@/hooks/useCart';

// Types
import type { ISingleProductProps } from '@/types/product';

/**
 * Handles the Add to cart functionality.
 * @param {ISingleProductProps} product // Product data
 * @param {number} variationId // Variation ID
 * @param {boolean} fullWidth // Whether the button should be full-width
 */
const AddToCart = ({
  product,
  variationId,
  fullWidth = false,
}: ISingleProductProps) => {
  const { addItem, isLoading, isUpdating } = useCart();

  const handleAddToCart = () => {
    if (product?.databaseId) {
      addItem(product.databaseId, variationId);
    }
  };

  return (
    <Button
      handleButtonClick={handleAddToCart}
      buttonDisabled={isUpdating || isLoading}
      fullWidth={fullWidth}
    >
      {isLoading ? 'Loading...' : 'KJØP'}
    </Button>
  );
};

export default AddToCart;
