import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

function IndexProducts(props) {
  return (
    <section className="py-8 bg-white">
      <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto">
        <nav id="store" className="top-0 z-30 w-full px-6 py-1">
          <div className="container flex flex-wrap items-center justify-between w-full px-2 py-3 mx-auto mt-0">
            <a
              className="text-xl font-bold tracking-wide text-gray-800 no-underline uppercase hover:no-underline "
              href="#"
            >
              Produkter
            </a>

            <div className="flex items-center" id="store-nav-content">
              <a
                className="inline-block pl-3 no-underline hover:text-black"
                href="#"
              >
                <svg
                  className="fill-current hover:text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 11H17V13H7zM4 7H20V9H4zM10 15H14V17H10z" />
                </svg>
              </a>
            </div>
          </div>
        </nav>

        {props.products.products.nodes.length ? (
          props.products.products.nodes.map(
            ({ productId, name, price, onSale, slug, image }) => (
              <div
                key={uuidv4()}
                className="flex flex-col w-full p-6 md:w-1/3 xl:w-1/4"
              >
                {/*<Link
                 
                  href={{
                    pathname: '/produkt',
                    query: { slug: slug },
                  }}
                >*/}
                <Link href="/produkt/[post]" as={`/produkt/${slug}`}>
                  <a>
                    <img
                      id="product-image"
                      className="transition duration-500 ease-in-out transform hover:grow hover:shadow-lg hover:scale-105"
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
                        {price}
                      </div>
                      <div className="pt-1 ml-2 text-gray-900"> {price}</div>
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
  );
}

export default IndexProducts;
