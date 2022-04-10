import { useState, useEffect } from 'react';

import AddToCartButton from 'components/Cart/AddToCartButton.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import WOO_CONFIG from 'utils/config/nextConfig';

import { filteredVariantPrice } from 'utils/functions/functions';

/**
 * Shows a single product with an Add To Cart button.
 * Uses GraphQL for product data
 * @param {Object} product // Product data
 */
const SingleProduct = ({ product }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariation, setselectedVariation] = useState();

  useEffect(() => {
    setIsLoading(false);
    if (product.variations) {
      const firstVariant = product.variations.nodes[0].databaseId;
      setselectedVariation(firstVariant);
    }
  }, []);

  const { description, image, name, onSale, price, regularPrice, salePrice } =
    product;

  // Strip out HTML from description
  const DESCRIPTION_WITHOUT_HTML = description.replace(/(<([^>]+)>)/gi, '');

  return (
    <section className="py-8 bg-white">
      {/* Show loading spinner while loading, and hide content while loading */}
      {isLoading ? (
        <div className="h-56 mt-20">
          <p className="text-2xl font-bold text-center">Laster produkt ...</p>
          <br />
          <LoadingSpinner />
        </div>
      ) : (
        <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto ">
          <div className="grid grid-cols-1 gap-4 mt-16 lg:grid-cols-2 xl:grid-cols-2 md:grid-cols-2 sm:grid-cols-2">
            {image && (
              <img
                id="product-image"
                className="h-auto p-8 transition duration-500 ease-in-out transform xl:p-2 md:p-2 lg:p-2 hover:grow hover:shadow-lg hover:scale-105"
                alt={name}
                src={image.sourceUrl}
              />
            )}
            {!image && (
              <img
                id="product-image"
                className="h-auto p-8 transition duration-500 ease-in-out transform xl:p-2 md:p-2 lg:p-2 hover:grow hover:shadow-lg hover:scale-105"
                alt={name}
                src={WOO_CONFIG.PLACEHOLDER_LARGE_IMAGE_URL}
              />
            )}
            <div className="ml-8">
              <p className="text-3xl font-bold text-left">{name}</p>
              <br />
              {/* Display sale price when on sale */}
              {onSale && (
                <div className="flex">
                  <p className="pt-1 mt-4 text-3xl text-gray-900">
                    {product.variations && filteredVariantPrice(price)}
                    {!product.variations && salePrice}
                  </p>
                  <p className="pt-1 pl-8 mt-4 text-2xl text-gray-900 line-through">
                    {product.variations && filteredVariantPrice(price, 'right')}
                    {!product.variations && regularPrice}
                  </p>
                </div>
              )}
              {/* Display regular price when not on sale */}
              {!onSale && (
                <p className="pt-1 mt-4 text-2xl text-gray-900"> {price}</p>
              )}
              <br />
              <p className="pt-1 mt-4 text-2xl text-gray-900">
                {DESCRIPTION_WITHOUT_HTML}
              </p>
              {product.variations && (
                <p className="pt-1 mt-4 text-xl text-gray-900">
                  <span className="py-2">Varianter</span>
                  <select
                    id="variant"
                    name="variant"
                    className="block w-64 px-6 py-2 bg-white border border-gray-500 rounded-lg focus:outline-none focus:shadow-outline"
                    onChange={(e) => {
                      setselectedVariation(e.target.value);
                    }}
                  >
                    {product.variations.nodes.map(
                      ({ id, name, databaseId }) => {
                        // Remove product name from variation name
                        const filteredName = name.split('- ').pop();
                        return (
                          <option key={id} value={databaseId}>
                            {filteredName}
                          </option>
                        );
                      }
                    )}
                  </select>
                </p>
              )}
              <div className="pt-1 mt-2">
                {
                  // Display default AddToCart button if we do not have variations.
                  // If we do, send the variationId to AddToCart button
                }
                {product.variations && (
                  <AddToCartButton product={selectedVariation} />
                )}
                {!product.variations && <AddToCartButton product={product} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SingleProduct;
