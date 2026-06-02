// Imports
import { useState, useMemo } from 'react';

// Utils
import { filteredVariantPrice, paddedPrice } from '@/utils/functions/functions';

// Components
import AddToCart from './AddToCart.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

// Types
import type { ISingleProductProps, ISingleProduct } from '@/types/product';

const PLACEHOLDER_FALLBACK = 'https://via.placeholder.com/600';

/** Format a price string by padding the currency symbol */
const formatPrice = (value: string | undefined): string | undefined => {
  if (!value) {
    return value;
  }
  return paddedPrice(value, 'kr');
};

/** Strip HTML tags from a string using DOMParser (client-side only) */
const useStrippedDescription = (html: string): string | null =>
  useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return new DOMParser().parseFromString(html, 'text/html').body
      .textContent;
  }, [html]);

/** Resolve the product image source URL */
const getImageSrc = (image: ISingleProduct['image']): string =>
  image?.sourceUrl ||
  process.env.NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL ||
  PLACEHOLDER_FALLBACK;

/** Get the current sale price based on whether the product has variations */
const getCurrentSalePrice = (
  hasVariations: boolean,
  price: string,
  salePrice: string | undefined,
): string | undefined =>
  hasVariations ? filteredVariantPrice(price, '') : salePrice;

/** Get the original (regular) price based on whether the product has variations */
const getOriginalSalePrice = (
  hasVariations: boolean,
  price: string,
  regularPrice: string | undefined,
): string | undefined =>
  hasVariations ? filteredVariantPrice(price, 'right') : regularPrice;

// --- Sub-components ---

const ProductImage = ({
  image,
  alt,
}: {
  image: ISingleProduct['image'];
  alt: string;
}) => (
  <div className="mb-6 md:mb-0 group">
    <div className="max-w-xl mx-auto aspect-[3/4] relative overflow-hidden bg-surface-alt">
      <img
        id="product-image"
        src={getImageSrc(image)}
        alt={alt}
        className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
      />
    </div>
  </div>
);

const PriceDisplay = ({
  onSale,
  hasVariations,
  price,
  salePrice,
  regularPrice,
}: {
  onSale: boolean;
  hasVariations: boolean;
  price: string | undefined;
  salePrice: string | undefined;
  regularPrice: string | undefined;
}) => {
  if (!onSale) {
    return <p className="text-xl font-bold text-text">{price}</p>;
  }

  const safePrice = price ?? '';
  const currentPrice = getCurrentSalePrice(hasVariations, safePrice, salePrice);
  const originalPrice = getOriginalSalePrice(hasVariations, safePrice, regularPrice);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
      <p className="text-xl font-bold text-error">{currentPrice}</p>
      <p className="text-xl text-text-light line-through">{originalPrice}</p>
    </div>
  );
};

const StockStatus = ({ quantity }: { quantity: number }) => (
  <div className="mb-6 mx-auto md:mx-0">
    <div className="p-2 bg-green-50 border border-success rounded-lg max-w-56">
      <p className="text-lg text-success font-semibold text-center md:text-left">
        {quantity} på lager
      </p>
    </div>
  </div>
);

const VariationSelector = ({
  variations,
  onSelect,
}: {
  variations: NonNullable<ISingleProduct['variations']>;
  onSelect: (id: number) => void;
}) => (
  <div className="mb-6 mx-auto md:mx-0 w-full max-w-56">
    <label
      htmlFor="variant"
      className="block text-lg font-medium mb-2 text-center md:text-left"
    >
      Varianter
    </label>
    <select
      id="variant"
      name="variant"
      className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      onChange={(e) => onSelect(Number(e.target.value))}
    >
      {variations.nodes.map(({ id, name, databaseId, stockQuantity }) => (
        <option key={id} value={databaseId}>
          {name.split('- ').pop()} - ({stockQuantity} på lager)
        </option>
      ))}
    </select>
  </div>
);

// --- Loading state ---

const ProductLoadingState = () => (
  <section className="bg-surface mb-32 md:mb-12">
    <div className="h-56 mt-20">
      <p className="text-xl font-bold text-center text-text">Laster produkt ...</p>
      <br />
      <LoadingSpinner />
    </div>
  </section>
);

// --- Product Details ---

const ProductDetails = ({
  product,
  hasVariations,
  price,
  salePrice,
  regularPrice,
  descriptionText,
  selectedVariation,
  onSelectVariation,
}: {
  product: ISingleProduct;
  hasVariations: boolean;
  price: string | undefined;
  salePrice: string | undefined;
  regularPrice: string | undefined;
  descriptionText: string | null;
  selectedVariation: number | undefined;
  onSelectVariation: (id: number) => void;
}) => {
  const resolvedVariationId = hasVariations ? selectedVariation : void 0;

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl md:text-3xl font-light text-center md:text-left mb-4 text-text">
        {product.name}
      </h1>

      <div className="text-center md:text-left mb-6">
        <PriceDisplay
          onSale={product.onSale}
          hasVariations={hasVariations}
          price={price}
          salePrice={salePrice}
          regularPrice={regularPrice}
        />
      </div>

      <p className="text-lg mb-6 text-center md:text-left text-text-muted">
        {descriptionText}
      </p>

      {Boolean(product.stockQuantity) && (
        <StockStatus quantity={product.stockQuantity} />
      )}

      {product.variations && (
        <VariationSelector
          variations={product.variations}
          onSelect={onSelectVariation}
        />
      )}

      <div className="w-full mx-auto md:mx-0 max-w-56">
        <AddToCart
          product={product}
          variationId={resolvedVariationId}
          fullWidth={true}
        />
      </div>
    </div>
  );
};

// --- Main Component ---

const SingleProduct = ({ product }: ISingleProductProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVariation, setSelectedVariation] = useState<number>();

  useVariationInitializer(product.variations, setSelectedVariation, setIsLoading);

  const price = formatPrice(product.price);
  const regularPrice = formatPrice(product.regularPrice);
  const salePrice = formatPrice(product.salePrice);
  const descriptionText = useStrippedDescription(product.description);
  const hasVariations = Boolean(product.variations);

  if (isLoading) {
    return <ProductLoadingState />;
  }

  return (
    <section className="bg-surface mb-32 md:mb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">
          <ProductImage image={product.image} alt={product.name} />
          <ProductDetails
            product={product}
            hasVariations={hasVariations}
            price={price}
            salePrice={salePrice}
            regularPrice={regularPrice}
            descriptionText={descriptionText}
            selectedVariation={selectedVariation}
            onSelectVariation={setSelectedVariation}
          />
        </div>
      </div>
    </section>
  );
};

export default SingleProduct;
