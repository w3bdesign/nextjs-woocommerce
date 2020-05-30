/**
 * Convert price from string to floating value and convert it to use two decimals
 * @param {String} string
 */
export const getFloatVal = (string) => {
  const stringWithoutKr = string.substring(2);
  const floatValue = parseFloat(stringWithoutKr);
  return null !== floatValue
    ? parseFloat(parseFloat(floatValue).toFixed(2))
    : '';
};

/**
 * Add first product to shopping cart
 * @param {Object} product
 */
export const addFirstProduct = (product) => {
  const { price } = product.product.products.edges[0].node;
  const productData = product.product.products.edges[0].node;
  let productPrice = getFloatVal(price);

  // If no item in cart, push first product to an empty array
  let newCart = {
    products: [],
    totalProductsCount: 1,
    totalProductsPrice: productPrice,
  };

  const newProduct = createNewProduct(productData, productPrice, 1);
  newCart.products.push(newProduct);

  localStorage.setItem('woocommerce-cart', JSON.stringify(newCart));
};

/**
 * Create a new product object
 * @param {Object} product
 * @param {Number} productPrice
 * @param {Number} quantity
 * @return { productId, image, name,  price, quantity,  totalPrice}
 */
export const createNewProduct = (product, productPrice, quantity) => {
  return {
    productId: product.productId,
    image: product.image.sourceUrl,
    name: product.name,
    price: productPrice,
    quantity: quantity,
    totalPrice: parseFloat((quantity * productPrice).toFixed(2)),
  };
};
