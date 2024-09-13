import React, { useState, useEffect } from 'react';
import { filteredVariantPrice, paddedPrice } from '@/utils/functions/functions';
import AddToCart, { IProductRootObject } from './AddToCart.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

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

interface IVariationNodes {
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

const SingleProduct: React.FC<IProductRootObject> = ({ product }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVariation, setSelectedVariation] = useState<
    number | undefined
  >();

  const placeholderFallBack = 'https://via.placeholder.com/600';

  let DESCRIPTION_WITHOUT_HTML: string | undefined;

  useEffect(() => {
    setIsLoading(false);
    if (product.variations) {
      const firstVariant = product.variations.nodes[0].databaseId;
      setSelectedVariation(firstVariant);
    }
  }, [product.variations]);

  let { description, image, name, onSale, price, regularPrice, salePrice } =
    product;

  if (price) price = paddedPrice(price, 'kr');
  if (regularPrice) regularPrice = paddedPrice(regularPrice, 'kr');
  if (salePrice) salePrice = paddedPrice(salePrice, 'kr');

  if (typeof window !== 'undefined') {
    DESCRIPTION_WITHOUT_HTML = new DOMParser().parseFromString(
      description,
      'text/html',
    ).body.textContent;
  }

  return (
    <section className="bg-white">
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
            <div className="flex flex-col space-y-4">
              <h1 className="text-3xl font-bold text-center md:text-left">
                {name}
              </h1>
              <div className="text-center md:text-left">
                {onSale ? (
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
                    <p className="text-3xl font-bold text-red-600">
                      {product.variations
                        ? filteredVariantPrice(price, '')
                        : salePrice}
                    </p>
                    <p className="text-xl text-gray-500 line-through">
                      {product.variations
                        ? filteredVariantPrice(price, 'right')
                        : regularPrice}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{price}</p>
                )}
              </div>
              <p className="text-gray-600 text-center md:text-left">
                {DESCRIPTION_WITHOUT_HTML}
              </p>
              {Boolean(product.stockQuantity) && (
                <p className="text-sm font-semibold text-center md:text-left">
                  {product.stockQuantity} på lager
                </p>
              )}
              {product.variations && (
                <div className="w-full">
                  <label
                    htmlFor="variant"
                    className="block text-sm font-medium text-gray-700 mb-2"
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
              <div className="flex justify-center md:justify-start">
                {product.variations ? (
                  <AddToCart
                    product={product}
                    variationId={selectedVariation}
                  />
                ) : (
                  <AddToCart product={product} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SingleProduct;
