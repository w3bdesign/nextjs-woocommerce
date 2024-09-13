import React, { useState, useEffect } from 'react';
import { filteredVariantPrice, paddedPrice } from '@/utils/functions/functions';
import AddToCart, { IProductRootObject } from './AddToCart.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';
import Button from '@/components/UI/Button.component';

const SingleProduct: React.FC<IProductRootObject> = ({
  product,
  variationId: initialVariationId,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVariation, setSelectedVariation] = useState<
    number | undefined
  >(initialVariationId);

  const placeholderFallBack = 'https://via.placeholder.com/600';

  let DESCRIPTION_WITHOUT_HTML: string | null = null;

  useEffect(() => {
    setIsLoading(false);
    if (product.variations && !selectedVariation) {
      const firstVariant = product.variations.nodes[0].databaseId;
      setSelectedVariation(firstVariant);
    }
  }, [product.variations, selectedVariation]);

  let { description, image, name, onSale, price, regularPrice, salePrice } =
    product;

  if (price) price = paddedPrice(price, 'kr');
  if (regularPrice) regularPrice = paddedPrice(regularPrice, 'kr');
  if (salePrice) salePrice = paddedPrice(salePrice, 'kr');

  if (typeof window !== 'undefined' && description) {
    DESCRIPTION_WITHOUT_HTML =
      new DOMParser().parseFromString(description, 'text/html').body
        .textContent || '';
  }

  const handleBuy = () => {
    console.log('Buy now clicked');
  };

  return (
    <section className="bg-white mb-16 sm:mb-24">
      {isLoading ? (
        <div className="h-56 mt-20">
          <p className="text-2xl font-bold text-center">Laster produkt ...</p>
          <br />
          <LoadingSpinner />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="w-full">
              {image ? (
                <img
                  id="product-image"
                  src={image.sourceUrl}
                  alt={name}
                  className="w-full h-auto object-cover rounded-lg shadow-md"
                />
              ) : (
                <img
                  id="product-image"
                  src={
                    process.env.NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL ??
                    placeholderFallBack
                  }
                  alt={name}
                  className="w-full h-auto object-cover rounded-lg shadow-md"
                />
              )}
            </div>
            <div className="flex flex-col space-y-6">
              <h1 className="text-3xl font-bold">{name}</h1>
              <div className="flex flex-col space-y-2">
                {onSale && <p className="text-sm">Før {regularPrice}</p>}
                <p className="text-4xl font-bold">
                  {product.variations
                    ? filteredVariantPrice(price, '')
                    : onSale
                      ? salePrice
                      : price}
                </p>
                <p className="text-sm">
                  Tilbudet gjelder til 19/09 eller så lenge lageret rekker.
                </p>
              </div>
              <div className="space-y-4">
                <AddToCart product={product} variationId={selectedVariation} />

                {product.variations && (
                  <div className="w-full">
                    <label
                      htmlFor="variant"
                      className="block text-sm font-medium mb-2"
                    >
                      Varianter
                    </label>
                    <select
                      id="variant"
                      name="variant"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) =>
                        setSelectedVariation(Number(e.target.value))
                      }
                      value={selectedVariation}
                    >
                      {product.variations.nodes.map(
                        ({ id, name, databaseId, stockQuantity }) => {
                          const filteredName = name.split('- ').pop();
                          return (
                            <option key={id} value={databaseId}>
                              {filteredName} - ({stockQuantity} på lager)
                            </option>
                          );
                        },
                      )}
                    </select>
                  </div>
                )}
              </div>
              {Boolean(product.stockQuantity) && (
                <p className="text-sm font-semibold">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  {product.stockQuantity}+ stk. på lager
                </p>
              )}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">
                  Produktbeskrivelse
                </h2>
                <p className="text-gray-600">{DESCRIPTION_WITHOUT_HTML}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SingleProduct;
