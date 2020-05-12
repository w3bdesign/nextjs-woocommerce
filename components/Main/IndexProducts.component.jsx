import Link from 'next/link';

function IndexProducts(props) {
  console.log(props.products.products);
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

        {props.products.products.map(
          ({ id, name, price, images, on_sale, regular_price }) => (
            <div
              key={id}
              className="flex flex-col w-full p-6 md:w-1/3 xl:w-1/4"
            >
              <Link
                href={{
                  pathname: '/produkt',
                  query: { id: id },
                }}
              >
                <a href={name}>
                  <img
                    id="product-image"
                    className="transition duration-500 ease-in-out transform hover:grow hover:shadow-lg hover:scale-105"
                    src={images[0].src}
                  />
                </a>
              </Link>
              <div className="flex justify-center pt-3">
                <p className="font-bold text-center">{name}</p>
              </div>
              {/* Display sale price when on sale */}
              {on_sale && (
                <>
                  <div className="flex justify-center">
                    <div className="pt-1 text-gray-900 line-through">
                      KR {regular_price}
                    </div>
                    <div className="pt-1 ml-2 text-gray-900">KR {price}</div>
                  </div>
                </>
              )}
              {/* Display regular price when not on sale */}
              {!on_sale && (
                <p className="pt-1 text-center text-gray-900">KR {price}</p>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default IndexProducts;
