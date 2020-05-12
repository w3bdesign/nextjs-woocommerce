import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const WooCommerce = new WooCommerceRestApi({
  // We are fetching values from .env
  url: process.env.WOO_URL,
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  version: 'wc/v3',
});

function getCategoriesFromRest() {
  return WooCommerce.get('products/categories');
}

export async function getWooCategories(req, res) {
    
  const WooCategories = await getCategoriesFromRest();
  
  res.status(200).json(WooCategories.data);
}

export default getWooCategories;
