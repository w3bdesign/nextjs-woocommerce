import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import Link from 'next/link';

import Header from 'components/Header/Header.component';
import Categories from 'components/Main/Categories.component';

const WooCommerce = new WooCommerceRestApi({
  // We are fetching values from .env
  url: `${process.env.WOO_URL}`,
  consumerKey: `${process.env.CONSUMER_KEY}`,
  consumerSecret: `${process.env.CONSUMER_SECRET}`,
  version: 'wc/v3',
});

function getProductsFromRest() {
  return (
    WooCommerce.get("products", {
      per_page: 20, // 20 products per page
    })
  )
}

async function getWooProducts(req, res) {
  const WooProducts = await getProductsFromRest();
  return WooProducts.data;
}

function Produkter(props) {
  return (
    <>
      <Header />
      <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto">
        {props.products.map(
          ({ id, name, price, images, on_sale, regular_price }) => (
            <div
              key={id}
              className="flex flex-col w-full p-6 mt-24 md:w-1/3 xl:w-1/4"
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
    </>
  );
}

export async function getServerSideProps() {
  const products = await getWooProducts();
  return {
    props: {
      products,
    },
  };
}
export default Produkter;
