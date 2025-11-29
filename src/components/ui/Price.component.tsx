import { cn } from '@/lib/utils';

interface PriceProps {
  /**
   * The price value (can include currency symbol)
   */
  value: string | null | undefined;
  /**
   * Whether this is a sale price (renders in red)
   */
  isSale?: boolean;
  /**
   * Whether this is a regular/original price (renders with line-through when on sale)
   */
  isOriginal?: boolean;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Currency symbol to auto-format (adds space after if not present)
   */
  currency?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Price component for consistent price display across the furniture store
 * Handles sale prices, original prices, and different size variants
 * Automatically formats currency by adding space after symbol
 */
export const Price = ({
  value,
  isSale = false,
  isOriginal = false,
  size = 'lg',
  currency = 'kr',
  className,
}: PriceProps) => {
  if (!value) return null;

  // Auto-format: Add space after currency if not present
  const formattedValue = value.includes(currency)
    ? value.split(currency).join(`${currency} `)
    : value;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const baseClasses = cn(
    'font-semibold',
    sizeClasses[size],
    {
      'text-red-600': isSale,
      'text-gray-500 line-through': isOriginal,
      'text-gray-900': !isSale && !isOriginal,
    },
    className,
  );

  return <span className={baseClasses}>{formattedValue}</span>;
};

/**
 * PriceGroup component for displaying sale price alongside original price
 */
interface PriceGroupProps {
  /**
   * Primary price field (used when not on sale)
   */
  price?: string | null | undefined;
  /**
   * Sale price (displayed in red when product is on sale)
   */
  salePrice?: string | null | undefined;
  /**
   * Regular/original price (shown with line-through when on sale)
   */
  regularPrice?: string | null | undefined;
  /**
   * Whether product is on sale (auto-detects sale pricing)
   */
  onSale?: boolean;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Currency symbol for formatting
   */
  currency?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Smart price group that handles all WooCommerce price scenarios
 * Automatically formats prices and handles sale/regular display
 */
export const PriceGroup = ({
  price,
  salePrice,
  regularPrice,
  onSale = false,
  size = 'lg',
  currency = 'kr',
  className,
}: PriceGroupProps) => {
  // Handle different WooCommerce price scenarios
  const displaySalePrice = onSale ? salePrice || price : null;
  const displayRegularPrice = onSale ? regularPrice : price || regularPrice;

  if (!displaySalePrice && !displayRegularPrice) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {displaySalePrice && (
        <Price
          value={displaySalePrice}
          isSale
          size={size}
          currency={currency}
        />
      )}
      {displayRegularPrice && displaySalePrice && (
        <Price
          value={displayRegularPrice}
          isOriginal
          size={size === 'xl' ? 'lg' : size}
          currency={currency}
        />
      )}
      {!displaySalePrice && displayRegularPrice && (
        <Price value={displayRegularPrice} size={size} currency={currency} />
      )}
    </div>
  );
};
