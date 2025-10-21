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
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Price component for consistent price display across the furniture store
 * Handles sale prices, original prices, and different size variants
 */
export const Price = ({
  value,
  isSale = false,
  isOriginal = false,
  size = 'lg',
  className,
}: PriceProps) => {
  if (!value) return null;

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
    className
  );

  return <span className={baseClasses}>{value}</span>;
};

/**
 * PriceGroup component for displaying sale price alongside original price
 */
interface PriceGroupProps {
  salePrice: string | null | undefined;
  regularPrice: string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PriceGroup = ({
  salePrice,
  regularPrice,
  size = 'lg',
  className,
}: PriceGroupProps) => {
  if (!salePrice && !regularPrice) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {salePrice && (
        <Price value={salePrice} isSale size={size} />
      )}
      {regularPrice && salePrice && (
        <Price value={regularPrice} isOriginal size={size === 'xl' ? 'lg' : size} />
      )}
      {!salePrice && regularPrice && (
        <Price value={regularPrice} size={size} />
      )}
    </div>
  );
};
