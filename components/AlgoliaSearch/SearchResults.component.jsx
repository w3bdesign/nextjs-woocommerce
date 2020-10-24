import Link from 'next/link';

/**
 * Displays search results from Algolia
 * @param {Object} hit {
 * @param {String} product_image Product image from WooCommerce
 * @param {String} product_name Name of product
 * @param {Float} regular_price Price without discount
 * @param {Float} sale_price Price when on sale
 * @param {Boolean} on_sale Is the product on sale? True or false
 * @param {String} short_description Short description of product
 * @param {Integer} objectID ID of product
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
    objectID,
  },
}) => {
  // Replace empty spaces with dash (-)
  const trimmedProductName = product_name.replace(/ /g, '-');

  return (
    <article className="cursor-pointer hit">
      <Link
        href="/produkt/[post]"
        as={`/produkt/${trimmedProductName}?id=${objectID}`}
      >
        <div className="flex p-6 bg-white">
          <header className="hit-image-container">
            <img
              src={product_image}
              alt={product_name}
              className="w-12 hit-image"
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
            <span className="text-base">{short_description}</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default SearchResults;
