'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { decodeHtmlEntities } from '@/utils/functions/productUtils';
import { PRICING_DATA } from './constants';

interface PricingProduct {
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  onSale?: boolean;
}

interface PricingSectionProps {
  product?: PricingProduct;
}

/**
 * Displays product pricing with optional sale information
 *
 * @component
 * @example
 * <PricingSection product={{
 *   price: "$99.99",
 *   regularPrice: "$129.99",
 *   salePrice: "$99.99",
 *   onSale: true
 * }} />
 *
 * @param {Object} props - Component props
 * @param {PricingProduct} [props.product] - Product data. If not provided, uses mock data.
 * @returns {React.ReactElement} Pricing display component
 */
export default function PricingSection({ product }: PricingSectionProps) {
  // Use mock data if no product provided
  if (!product) {
    const mockData = PRICING_DATA;
    return (
      <Card className="m-0 rounded-none border-0 border-b">
        <CardContent
          className={cn('p-4', 'bg-gradient-to-r from-orange-50 to-red-50')}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Original</span>
              <span
                className="text-sm text-muted-foreground line-through"
                aria-label={`Original price ${mockData.originalPrice}`}
              >
                {mockData.originalPrice}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-success">Save</span>
              <span
                className="text-sm font-bold text-success"
                aria-label={`Savings ${mockData.savings}`}
              >
                {mockData.savings}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-orange-200">
              <span className="text-sm font-semibold text-foreground">
                Price
              </span>
              <span
                className="text-2xl font-bold text-orange-600"
                aria-label={`Current price ${mockData.currentPrice}`}
              >
                {mockData.currentPrice}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract and decode price data once (DRY principle)
  const decodedCurrentPrice = decodeHtmlEntities(product.price || '');
  const decodedRegularPrice = decodeHtmlEntities(product.regularPrice || '');
  const decodedSalePrice = decodeHtmlEntities(product.salePrice || null);
  const onSale = product.onSale ?? false;

  // Determine display prices from decoded values
  const displayPrice =
    onSale && decodedSalePrice ? decodedSalePrice : decodedCurrentPrice;
  const displayOriginal = decodedRegularPrice || decodedCurrentPrice;
  const displaySavings = decodedRegularPrice;

  return (
    <Card className="m-0 rounded-none border-0 border-b">
      <CardContent
        className={cn(
          'p-4',
          onSale ? 'bg-gradient-to-r from-orange-50 to-red-50' : 'bg-gray-50',
        )}
      >
        <div className="space-y-2">
          {onSale && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Original</span>
              <span
                className="text-sm text-muted-foreground line-through"
                aria-label={`Original price ${displayOriginal}`}
              >
                {displayOriginal}
              </span>
            </div>
          )}
          {onSale && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-success">Save</span>
              <span
                className="text-sm font-bold text-success"
                aria-label={`Savings ${displaySavings}`}
              >
                {displaySavings}
              </span>
            </div>
          )}
          <div
            className={cn(
              'flex items-center justify-between',
              onSale && 'pt-2 border-t border-orange-200',
            )}
          >
            <span className="text-sm font-semibold text-foreground">Price</span>
            <span
              className={cn(
                'text-2xl font-bold',
                onSale ? 'text-orange-600' : 'text-foreground',
              )}
              aria-label={`Current price ${displayPrice}`}
            >
              {displayPrice}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
