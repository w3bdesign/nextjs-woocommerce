/**
 * Convert price from string to floating value
 * @param {String} string 
 */
export const getFloatVal = (string) => {
  const stringWithoutKr = string.substring(2);
  const floatValue = parseFloat(stringWithoutKr);
  console.log('Float value: ');
  console.log(floatValue);

  //let floatValue = string.match( )
};

/**
 * Add first product to shopping cart
 * @param {Object} product 
 */
export const addFirstProduct = (product) => {
  // console.log(product)
  const { price } = product.product.products.edges[0].node;
  console.log('Add first product: ');
  console.log(price);

  let productPrice = getFloatVal(price);
};
