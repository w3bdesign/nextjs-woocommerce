import Link from 'next/link';

/**
 * Displays search results from Algolia
 * @param {Object} props
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
  console.log("Product image: ");
  console.log(product_image);
  
  return (
    <article className="cursor-pointer hit">
      <Link
        href="/produkt/[post]"
        as={`/produkt/${product_name}?productId=${objectID}`}
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
              <span class="text-lg font-bold">{product_name}</span>
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
