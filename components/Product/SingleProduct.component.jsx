import { useState, useEffect } from 'react';

import AddToCartButton from 'components/Cart/AddToCartButton.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

/**
 * Shows a single product with an Add To Cart button.
 * Uses GraphQL for product data
 * @param {Object} props // Product data
 */
const SingleProduct = (props) => {
  //const { product } = props.product.products.edges[0].node;
  //console.log(product);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // useEffect with empty array is the same as componentDidMount
    setIsLoading(false);
  }, []);

  const {
    description,
    image,
    name,
    onSale,
    productId,
    price,
    regularPrice,
    salePrice,
  } = props.product.products.edges[0].node;

  // Strip out HTML from description
  const DESCRIPTION_WITHOUT_HTML = description.replace(/(<([^>]+)>)/gi, '');

  const product = props.product.products.edges[0].node;

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
            <img
              id="product-image"
              className="h-auto p-8 transition duration-500 ease-in-out transform xl:p-2 md:p-2 lg:p-2 hover:grow hover:shadow-lg hover:scale-105"
              src={image.sourceUrl}
            />
            <div className="ml-8">
              <p className="text-3xl font-bold text-left">{name}</p>
              <br />
              {/* Display sale price when on sale */}
              {onSale && (
                <>
                  <div className="flex">
                    <p className="pt-1 mt-4 text-3xl text-gray-900">
                      {salePrice}
                    </p>
                    <p className="pt-1 pl-8 mt-4 text-2xl text-gray-900 line-through">
                      {regularPrice}
                    </p>
                  </div>
                </>
              )}
              {/* Display regular price when not on sale */}
              {!onSale && (
                <p className="pt-1 mt-4 text-2xl text-gray-900"> {price}</p>
              )}
              <br />
              <p className="pt-1 mt-4 text-2xl text-gray-900">
                {DESCRIPTION_WITHOUT_HTML}
              </p>
              <p className="pt-1 mt-4 text-xl text-gray-900">
                <span className="py-2">Farge</span>
                <select
                  id="farge"
                  className="block w-64 px-6 py-2 bg-white border border-gray-500 rounded-lg focus:outline-none focus:shadow-outline"
                >
                  <option value="sort">Blå</option>
                </select>
              </p>
              <p className="pt-1 mt-2 text-xl text-gray-900 ">
                <span className="py-2">Størrelse</span>
                <select
                  id="størrelse"
                  className="block w-64 px-6 py-2 bg-white border border-gray-500 rounded-lg focus:outline-none focus:shadow-outline"
                >
                  <option value="sort">Large</option>
                </select>
              </p>
              <p className="pt-1 mt-2">
                <AddToCartButton product={product} />
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SingleProduct;
