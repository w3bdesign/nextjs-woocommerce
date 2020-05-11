import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const WooCommerce = new WooCommerceRestApi({
  // We are fetching values from next.config.js
  url: process.env.WooUrl,
  consumerKey: process.env.consumerKey,
  consumerSecret: process.env.consumerSecret,
  version: 'wc/v3',
});

async function getProductsFromRest() {
  return await WooCommerce.get('products');
}

export async function getWooProducts(req, res) {
  const WooProducts = getProductsFromRest();
  res.status(200).json(WooProducts.data);
}

export default getWooProducts;
