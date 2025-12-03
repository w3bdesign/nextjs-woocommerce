import { Price } from '@/components/ui/Price.component';
import {
  TypographyLarge,
  TypographyP,
} from '@/components/ui/Typography.component';
import { trimmedStringToLength } from '@/utils/functions/functions';
import Link from 'next/link';

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
 * @param {object} hit {
 * @param {string} product_image Product image from WooCommerce
 * @param {string} product_name Name of product
 * @param {string} regular_price Price without discount
 * @param {string} sale_price Price when on sale
 * @param {boolean} on_sale Is the product on sale? True or false
 * @param {string} short_description Short description of product
 }
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
      <Link href={`/product/${product_name.replace(/ /g, '-')}`} passHref>
        <div className="flex p-6 bg-white">
          <header className="hit-image-container">
            <img
              src={product_image}
              alt={product_name}
              className="w-12 hit-image"
            />
          </header>
          <div className="pl-4 text-left">
            {product_name && <TypographyLarge>{product_name}</TypographyLarge>}
            <br />
            <div className="flex items-center gap-2">
              {on_sale ? (
                <>
                  <Price value={sale_price} isSale size="md" />
                  <Price value={regular_price} isOriginal size="sm" />
                </>
              ) : (
                <Price value={regular_price} size="md" />
              )}
            </div>
            <br />
            <TypographyP className="inline">
              {trimmedStringToLength(short_description, 30)}
            </TypographyP>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default SearchResults;
