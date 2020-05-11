import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const WooCommerce = new WooCommerceRestApi({
  // We are fetching values from next.config.js
  url: process.env.WOO_URL,
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  version: 'wc/v3',
});

function getProductsFromRest() {
  return WooCommerce.get('products');
}

export async function getWooProducts(req, res) {
  const WooProducts = await getProductsFromRest();
  res.status(200).json(WooProducts.data);
}

export default getWooProducts;
