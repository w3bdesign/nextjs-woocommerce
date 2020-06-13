import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

import PageTitle from 'components/Header/PageTitle.component';

/**
 * Displays all of the products as long as length is defined.
 * Does a map() over the props array and utilizes uuidv4 for unique key values.
 * @param {Object} products
 */
const IndexProducts = ({ products }) => {
  return (
    <>
      <PageTitle title="Produkter" />

      <section className="py-4 bg-white">
        <div className="container flex flex-wrap items-center mx-auto">
          {products ? (
            products.map(
              ({
                productId,
                name,
                price,
                regularPrice,
                salePrice,
                onSale,
                slug,
                image,
              }) => (
                <div
                  key={uuidv4()}
                  className="flex flex-col w-full p-6 md:w-1/2 xl:w-1/4"
                >
                  <Link
                    href="/produkt/[post]"
                    as={`/produkt/${slug}?productId=${productId}`}
                  >
                    <a>
                      <img
                        id="product-image"
                        className="object-cover w-full h-64 transition duration-500 ease-in-out transform hover:grow hover:shadow-lg hover:scale-105"
                        src={image.sourceUrl}
                      />
                    </a>
                  </Link>
                  <div className="flex justify-center pt-3">
                    <p className="font-bold text-center">{name}</p>
                  </div>
                  {/* Display sale price when on sale */}
                  {onSale && (
                    <>
                      <div className="flex justify-center">
                        <div className="pt-1 text-gray-900 line-through">
                          {regularPrice}
                        </div>
                        <div className="pt-1 ml-2 text-gray-900">
                          {salePrice}
                        </div>
                      </div>
                    </>
                  )}
                  {/* Display regular price when not on sale */}
                  {!onSale && (
                    <p className="pt-1 text-center text-gray-900"> {price}</p>
                  )}
                </div>
              )
            )
          ) : (
            <div className="mx-auto text-xl font-bold text-center text-gray-800 no-underline uppercase">
              Ingen produkter funnet
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default IndexProducts;
