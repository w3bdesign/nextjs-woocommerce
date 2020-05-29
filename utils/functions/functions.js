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
  let productPrice = getFloatVal(price);

  // If no item in cart, push first product to an empty array
  let newCart = {
    products: [],
    totalProductsCount: 1,
    totalProductsPrice: productPrice,
  };

  const newProduct = createNewProduct(product, productPrice);
};

/**
 * Create a new product
 * @param {Object} product
 * @param {Number} productPrice
 */
export const createNewProduct = (product, productPrice) => {
  
};
