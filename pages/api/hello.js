import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const WooCommerce = new WooCommerceRestApi({
  // We are fetching values from next.config.js
  url: process.env.url,
  consumerKey: process.env.consumerKey,
  consumerSecret: process.env.consumerSecret,
  version: 'wc/v3',
});

function getProducts() {
  return WooCommerce.get('products');
}

export async function Hello(req, res) {
  const WooProducts = await getProducts();
  res.status(200).json(WooProducts.data);
}

export default Hello;
