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
    <section className="bg-white mb-12 sm:mb-2">
      {/* Show loading spinner while loading, and hide content while loading */}
      {isLoading ? (
        <div className="h-56 mt-20">
          <p className="text-2xl font-bold text-center">Laster produkt ...</p>
          <br />
          <LoadingSpinner />
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
            {image && (
              <div className="flex justify-center items-center">
                <img
                  id="product-image"
                  src={image.sourceUrl}
                  alt={name}
                  className="max-w-full h-auto transition duration-500 ease-in-out transform hover:scale-105"
                />
              </div>
            )}
            {!image && (
              <div className="flex justify-center items-center">
                <img
                  id="product-image"
                  src={
                    process.env.NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL ??
                    placeholderFallBack
                  }
                  alt={name}
                  className="max-w-full h-auto transition duration-500 ease-in-out transform hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-col justify-center text-center md:text-left">
              <h1 className="text-3xl font-bold mb-4">{name}</h1>
              {/* Display sale price when on sale */}
              {onSale && (
                <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start mb-4">
                  <p className="text-3xl font-bold text-red-600 mr-4">
                    {product.variations && filteredVariantPrice(price, '')}
                    {!product.variations && salePrice}
                  </p>
                  <p className="text-2xl text-gray-500 line-through">
                    {product.variations && filteredVariantPrice(price, 'right')}
                    {!product.variations && regularPrice}
                  </p>
                </div>
              )}
              {/* Display regular price when not on sale */}
              {!onSale && (
                <p className="text-3xl font-bold mb-4">{price}</p>
              )}
              <p className="text-lg mb-4">{DESCRIPTION_WITHOUT_HTML}</p>
              {Boolean(product.stockQuantity) && (
                <p className="text-lg mb-4">
                  {product.stockQuantity} på lager
                </p>
              )}
              {product.variations && (
                <div className="mb-4">
                  <label htmlFor="variant" className="block text-lg mb-2">Varianter</label>
                  <select
                    id="variant"
                    name="variant"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="flex justify-center md:justify-start">
                {product.variations && (
                  <AddToCart
                    product={product}
                    variationId={selectedVariation}
                  />
                )}
                {!product.variations && <AddToCart product={product} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SingleProduct;
