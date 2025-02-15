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
      {isLoading ? (
        <div className="h-56 mt-20">
          <p className="text-xl font-bold text-center">Laster produkt ...</p>
          <br />
          <LoadingSpinner />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">
            {/* Image Container */}
            <div className="mb-6 md:mb-0 group">
              <div className="max-w-xl mx-auto aspect-[3/4] relative overflow-hidden bg-gray-100">
                <img
                  id="product-image"
                  src={
                    image?.sourceUrl ||
                    process.env.NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL ||
                    placeholderFallBack
                  }
                  alt={name}
                  className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Product Details Container */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-center md:text-left mb-4">
                {name}
              </h1>

              {/* Price Display */}
              <div className="text-center md:text-left mb-6">
                {onSale ? (
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
                    <p className="text-2xl font-bold text-red-600">
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

              {/* Description */}
              <p className="text-lg mb-6 text-center md:text-left">
                {DESCRIPTION_WITHOUT_HTML}
              </p>

              {/* Stock Status */}
              {Boolean(product.stockQuantity) && (
                <div className="mb-6 mx-auto md:mx-0">
                  <div className="p-2 bg-green-100 border border-green-400 rounded-lg max-w-[14.375rem]">
                    <p className="text-lg text-green-700 font-semibold text-center md:text-left">
                      {product.stockQuantity} på lager
                    </p>
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
                    Varianter
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
                          {name.split('- ').pop()} - ({stockQuantity} på lager)
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
        </div>
      )}
    </section>
  );
};

export default SingleProduct;
