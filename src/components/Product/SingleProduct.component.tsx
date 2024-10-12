/*eslint complexity: ["error", 20]*/
// Imports
import { useState, useEffect } from 'react';

// Utils
import { filteredVariantPrice, paddedPrice } from '@/utils/functions/functions';

// Components
import AddToCart, { IProductRootObject } from './AddToCart.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

const SingleProduct = ({ product }: IProductRootObject) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVariation, setSelectedVariation] = useState<number>();

  const placeholderFallBack = 'https://via.placeholder.com/600';

  let DESCRIPTION_WITHOUT_HTML;

  useEffect(() => {
    setIsLoading(false);
    if (product.variations) {
      const firstVariant = product.variations.nodes[0].databaseId;
      setSelectedVariation(firstVariant);
    }
  }, [product.variations]);

  let { description, image, name, onSale, price, regularPrice, salePrice } =
    product;

  // Add padding/empty character after currency symbol here
  if (price) {
    price = paddedPrice(price, 'kr');
  }
  if (regularPrice) {
    regularPrice = paddedPrice(regularPrice, 'kr');
  }
  if (salePrice) {
    salePrice = paddedPrice(salePrice, 'kr');
  }

  // Strip out HTML from description
  if (process.browser) {
    DESCRIPTION_WITHOUT_HTML = new DOMParser().parseFromString(
      description,
      'text/html',
    ).body.textContent;
  }

  return (
    <section className="bg-white mb-[8rem] md:mb-12">
      {/* Show loading spinner while loading, and hide content while loading */}
      {isLoading ? (
        <div className="h-56 mt-20">
          <p className="text-2xl font-bold text-center">Laster produkt ...</p>
          <br />
          <LoadingSpinner />
        </div>
      ) : (
        <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto">
          <div className="grid grid-cols-1 gap-4 md:mt-16 lg:grid-cols-2 xl:grid-cols-2 md:grid-cols-2 sm:grid-cols-2">
            {image && (
              <img
                id="product-image"
                src={image.sourceUrl}
                alt={name}
                className="h-auto p-8 transition duration-500 ease-in-out transform xl:p-2 md:p-2 lg:p-2 md:hover:grow md:hover:scale-105"
              />
            )}
            {!image && (
              <img
                id="product-image"
                src={
                  process.env.NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL ??
                  placeholderFallBack
                }
                alt={name}
                className="h-auto p-8 transition duration-500 ease-in-out transform xl:p-2 md:p-2 lg:p-2 md:hover:grow md:hover:shadow-lg md:hover:scale-105"
              />
            )}
            <div className="px-4 md:ml-8">
              <h1 className="text-2xl font-bold text-center md:text-left mb-4">
                {name}
              </h1>
              {/* Display sale price when on sale */}
              {onSale && (
                <div className="flex flex-col md:flex-row items-center md:items-start mb-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {product.variations && filteredVariantPrice(price, '')}
                    {!product.variations && salePrice}
                  </p>
                  <p className="text-xl text-gray-500 line-through md:ml-4">
                    {product.variations && filteredVariantPrice(price, 'right')}
                    {!product.variations && regularPrice}
                  </p>
                </div>
              )}
              {/* Display regular price when not on sale */}
              {!onSale && <p className="text-2xl font-bold mb-4">{price}</p>}
              <p className="text-lg mb-4 text-center md:text-left">
                {DESCRIPTION_WITHOUT_HTML}
              </p>
              {Boolean(product.stockQuantity) && (
                <div className="mb-4 p-2 bg-green-100 border border-green-400 rounded-lg mx-auto md:mx-0 max-w-[14.375rem]">
                  <p className="text-lg text-green-700 font-semibold text-center md:text-left">
                    {product.stockQuantity} på lager
                  </p>
                </div>
              )}
              {product.variations && (
                <div className="mb-4">
                  <label
                    htmlFor="variant"
                    className="block text-lg font-medium mb-2"
                  >
                    Varianter
                  </label>
                  <select
                    id="variant"
                    name="variant"
                    className="max-w-[14.375rem] block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      setSelectedVariation(Number(e.target.value));
                    }}
                  >
                    {product.variations.nodes.map(
                      ({ id, name, databaseId, stockQuantity }) => {
                        // Remove product name from variation name
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
              <div className="w-full p-4 md:p-0">
                {product.variations && (
                  <AddToCart
                    product={product}
                    variationId={selectedVariation}
                    fullWidth={true}
                  />
                )}
                {!product.variations && (
                  <AddToCart product={product} fullWidth={true} />
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
