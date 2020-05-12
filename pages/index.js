import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

import Header from 'components/Header/Header.component';
import Hero from 'components/Main/Hero.component';
import IndexProducts from 'components/Main/IndexProducts.component';

const WooCommerce = new WooCommerceRestApi({
  // We are fetching values from .env
  url: `${process.env.WOO_URL}`,
  consumerKey: `${process.env.CONSUMER_KEY}`,
  consumerSecret: `${process.env.CONSUMER_SECRET}`,
  version: 'wc/v3',
});

function getProductsFromRest() {
  return WooCommerce.get('products');
}

async function getWooProducts(req, res) {
  const WooProducts = await getProductsFromRest();
 
  return WooProducts.data;
}

function HomePage(props) {
  // We can destructure here or inside the map.
  // We should probably destructure in the function declaration.
  console.log(props);
  return (
    <>
      <Header />
      <Hero />
      <IndexProducts products={props} />
    </>
  );
}

// Prerender data for quicker loading.
// Should we use getServerSideProps?

export async function getStaticProps() {
  const products = await getWooProducts();
  return {
    props: {
      products,
    },
  };
}

export default HomePage;
