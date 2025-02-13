/*eslint complexity: ["error", 20]*/
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

import { filteredVariantPrice, paddedPrice } from '@/utils/functions/functions';

interface Image {
  __typename: string;
  sourceUrl?: string;
}

interface Node {
  __typename: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
}

interface Variations {
  __typename: string;
  nodes: Node[];
}

interface RootObject {
  __typename: string;
  databaseId: number;
  name: string;
  onSale: boolean;
  slug: string;
  image: Image;
  price: string;
  regularPrice: string;
  salePrice?: string;
  variations: Variations;
}

interface IDisplayProductsProps {
  products: RootObject[];
}

/**
 * Displays all of the products as long as length is defined.
 * Does a map() over the props array and utilizes uuidv4 for unique key values.
 * @function DisplayProducts
 * @param {IDisplayProductsProps} products Products to render
 * @returns {JSX.Element} - Rendered component
 */

const DisplayProducts = ({ products }: IDisplayProductsProps) => (
  <section className="container mx-auto bg-white py-12">
    <div
      id="product-container"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {products ? (
        products.map(
          ({
            databaseId,
            name,
            price,
            regularPrice,
            salePrice,
            onSale,
            slug,
            image,
            variations,
          }) => {
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

            return (
              <div key={uuidv4()} className="group">
                <Link
                  href={`/produkt/${encodeURIComponent(
                    slug,
                  )}?id=${encodeURIComponent(databaseId)}`}
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                    {image ? (
                      <img
                        id="product-image"
                        className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
                        alt={name}
                        src={image.sourceUrl}
                      />
                    ) : (
                      <img
                        id="product-image"
                        className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
                        alt={name}
                        src={process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL}
                      />
                    )}
                  </div>
                </Link>
                <Link
                  href={`/produkt/${encodeURIComponent(
                    slug,
                  )}?id=${encodeURIComponent(databaseId)}`}
                >
                  <span>
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-center cursor-pointer hover:text-gray-600 transition-colors">
                        {name}
                      </p>
                    </div>
                  </span>
                </Link>
                <div className="mt-2 text-center">
                  {onSale ? (
                    <div className="flex justify-center items-center space-x-2">
                      <span className="text-xl font-bold text-red-600">
                        {variations && filteredVariantPrice(price, '')}
                        {!variations && salePrice}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {variations && filteredVariantPrice(price, 'right')}
                        {!variations && regularPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg text-gray-900">
                      {price}
                    </span>
                  )}
                </div>
              </div>
            );
          },
        )
      ) : (
        <div className="mx-auto text-xl font-bold text-center text-gray-800 no-underline uppercase">
          Ingen produkter funnet
        </div>
      )}
    </div>
  </section>
);

export default DisplayProducts;
