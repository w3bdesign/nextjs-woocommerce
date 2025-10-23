// Imports
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Components
import { Container } from '@/components/Layout/Container.component';
import { PriceGroup } from '@/components/UI/Price.component';
import { Skeleton } from '@/components/ui/skeleton';
import AddToCart, { IProductRootObject } from './AddToCart.component';

// Dynamically import 3D configurator to avoid SSR issues
const ProductConfigurator = dynamic(
  () => import('@/components/Configurator/ProductConfigurator.component'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[750px] flex items-center justify-center bg-gray-100 rounded-lg">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

const SingleProduct = ({ product }: IProductRootObject) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVariation, setSelectedVariation] = useState<number>();

  useEffect(() => {
    setIsLoading(false);
    if (product.variations) {
      const firstVariant = product.variations.nodes[0].databaseId;
      setSelectedVariation(firstVariant);
    }
  }, [product.variations]);

  const { name, onSale, price, regularPrice, salePrice } = product;

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
          {/* Configurator takes full width */}
          <div className="mb-6 md:mb-0">
            {product.configurator?.enabled ? (
              <ProductConfigurator
                modelId={product.configurator.modelId}
                product={product}
              />
            ) : (
              <div className="max-w-xl mx-auto aspect-[3/4] relative overflow-hidden bg-gray-100">
                <img
                  src={product.image?.sourceUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Price and Purchase Section - Below Configurator */}
          <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
            {/* Left: Price Display */}
            <div>
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

            {/* Right: Add to Cart */}
            <div className="flex flex-col gap-4">
              {/* Variations Select */}
              {product.variations && (
                <div className="w-full md:w-64">
                  <label
                    htmlFor="variant"
                    className="block text-sm font-medium mb-2"
                  >
                    Select Variation
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
              <div className="w-full md:w-64">
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
