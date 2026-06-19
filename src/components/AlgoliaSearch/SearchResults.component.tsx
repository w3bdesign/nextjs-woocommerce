import Link from 'next/link';
import Image from 'next/image';
import { trimmedStringToLength } from '@/utils/functions/functions';

interface ISearchResultProps {
  hit: {
    product_image: string;
    product_name: string;
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    short_description: string;
    slug: string;
  };
}

/**
 * Displays search results from Algolia
 * @param {object} hit - Algolia hit object
 * @param {string} hit.product_image - Product image from WooCommerce
 * @param {string} hit.product_name - Name of product
 * @param {string} hit.regular_price - Price without discount
 * @param {string} hit.sale_price - Price when on sale
 * @param {boolean} hit.on_sale - Is the product on sale? True or false
 * @param {string} hit.short_description - Short description of product
 */
const SearchResults = ({
  hit: {
    product_image,
    product_name,
    regular_price,
    sale_price,
    on_sale,
    short_description,
  },
}: ISearchResultProps) => {
  return (
    <article className="cursor-pointer hit">
      <Link
        href={`/produkt/${product_name.replace(/ /g, '-')}`}
        passHref
      >
        <div className="flex p-6 bg-surface">
          <header className="hit-image-container relative w-12 h-12">
            <Image
              src={product_image}
              alt={product_name}
              fill
              sizes="48px"
              className="hit-image object-cover"
            />
          </header>
          <div className="pl-4 text-left">
            {product_name && (
              <span className="text-lg font-bold">{product_name}</span>
            )}
            <br />
            {on_sale && (
              <>
                <span className="text-base line-through">
                  kr {regular_price}
                </span>
                <span className="ml-2 text-base">kr {sale_price}</span>
              </>
            )}
            {!on_sale && <span className="text-base">kr {regular_price}</span>}
            <br />
            <span className="text-base">
              {trimmedStringToLength(short_description, 30)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default SearchResults;
