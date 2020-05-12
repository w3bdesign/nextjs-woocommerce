import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

import Header from 'components/Header/Header.component';
import Categories from 'components/Main/Categories.component';

const WooCommerce = new WooCommerceRestApi({
  // We are fetching values from .env
  url: `${process.env.WOO_URL}`,
  consumerKey: `${process.env.CONSUMER_KEY}`,
  consumerSecret: `${process.env.CONSUMER_SECRET}`,
  version: 'wc/v3',
});

function getCategoriesFromRest() {
  return WooCommerce.get('products/categories');
}

export async function getWooCategories(req, res) {  
  const WooCategories = await getCategoriesFromRest();
  return WooCategories.data;
}

function CategoryPage(props) {
  return (
    <>
      <Header />
      <Categories categories={props} />
    </>
  );
}

// Prerender data for quicker loading.
// Should we use getServerSideProps?
export async function getStaticProps() {
  const posts = await getWooCategories();
  return {
    props: {
      posts,
    },
  };
}

export default CategoryPage;
