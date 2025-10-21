// Imports
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Components
import AddToCart, { IProductRootObject } from './AddToCart.component';
import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/Layout/Container.component';
import {
  TypographyH1,
  TypographyP,
  TypographyLarge,
} from '@/components/UI/Typography.component';
import { PriceGroup } from '@/components/UI/Price.component';

// Dynamically import 3D configurator to avoid SSR issues
const ProductConfigurator = dynamic(
  () => import('@/components/Configurator/ProductConfigurator.component'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

const SingleProduct = ({ product }: IProductRootObject) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVariation, setSelectedVariation] = useState<number>();

  let DESCRIPTION_WITHOUT_HTML;

  useEffect(() => {
    setIsLoading(false);
    if (product.variations) {
      const firstVariant = product.variations.nodes[0].databaseId;
      setSelectedVariation(firstVariant);
    }
  }, [product.variations]);

  const { description, name, onSale, price, regularPrice, salePrice } = product;

  // Strip out HTML from description
  if (process.browser) {
    DESCRIPTION_WITHOUT_HTML = new DOMParser().parseFromString(
      description,
      'text/html',
    ).body.textContent;
  }

  return (
    <section className="bg-white mb-[8rem] md:mb-12">
      {isLoading ? (
        <Container paddingClassName="px-4 py-8">
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">
            {/* Image Skeleton */}
            <div className="mb-6 md:mb-0">
              <Skeleton className="w-full max-w-xl mx-auto aspect-[3/4]" />
            </div>

            {/* Product Details Skeleton */}
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-10 w-32 mt-6" />
            </div>
          </div>
        </Container>
      ) : (
        <Container paddingClassName="px-4 py-8">
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">
            {/* Image/Configurator Container */}
            <div className="mb-6 md:mb-0 group">
              <div className="max-w-xl mx-auto aspect-[3/4] relative overflow-hidden bg-gray-100">
                {product.configurator?.enabled ? (
                  <ProductConfigurator modelId={product.configurator.modelId} />
                ) : (
                  <img
                    src={product.image?.sourceUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Product Details Container */}
            <div className="flex flex-col">
              <TypographyH1 className="text-center md:text-left mb-4">
                {name}
              </TypographyH1>

              {/* Price Display */}
              <div className="text-center md:text-left mb-6">
                {product.variations ? (
                  <PriceGroup
                    price={price}
                    onSale={onSale}
                    size="xl"
                    currency="kr"
                  />
                ) : (
                  <PriceGroup
                    price={price}
                    salePrice={salePrice}
                    regularPrice={regularPrice}
                    onSale={onSale}
                    size="xl"
                    currency="kr"
                  />
                )}
              </div>

              {/* Description */}
              <TypographyP className="mb-6 text-center md:text-left">
                {DESCRIPTION_WITHOUT_HTML}
              </TypographyP>

              {/* Stock Status */}
              {Boolean(product.stockQuantity) && (
                <div className="mb-6 mx-auto md:mx-0">
                  <div className="p-2 bg-green-100 border border-green-400 rounded-lg max-w-[14.375rem]">
                    <TypographyLarge className="text-green-700 text-center md:text-left">
                      {product.stockQuantity} in stock
                    </TypographyLarge>
                  </div>
                </div>
              )}

              {/* Variations Select */}
              {product.variations && (
                <div className="mb-6 mx-auto md:mx-0 w-full max-w-[14.375rem]">
                  <label
                    htmlFor="variant"
                    className="block text-lg font-medium mb-2 text-center md:text-left"
                  >
                    Variations
                  </label>
                  <select
                    id="variant"
                    name="variant"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setSelectedVariation(Number(e.target.value))
                    }
                  >
                    {product.variations.nodes.map(
                      ({ id, name, databaseId, stockQuantity }) => (
                        <option key={id} value={databaseId}>
                          {name.split('- ').pop()} - ({stockQuantity} in stock)
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="w-full mx-auto md:mx-0 max-w-[14.375rem]">
                {product.variations ? (
                  <AddToCart
                    product={product}
                    variationId={selectedVariation}
                    fullWidth={true}
                  />
                ) : (
                  <AddToCart product={product} fullWidth={true} />
                )}
              </div>
            </div>
          </div>
        </Container>
      )}
    </section>
  );
};

export default SingleProduct;
