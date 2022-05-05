import { v4 as uuidv4 } from 'uuid';

/**
 * Shorten inputted string (usually product description) to a maximum of length
 * @param {String} string The string that we input
 * @param {Integer} length The length that we want to shorten the text to
 */
export const trimmedStringToLength = (string, length) => {
  if (string.length > length) {
    const subStr = string.substring(0, length);
    return `${subStr}...`;
  }
  return string;
};

/**
 * Filter variant price. Changes "kr198.00 - kr299.00" to kr299.00 or kr198 depending on the side variable
 * @param {String} side Which side of the string to return (which side of the "-" symbol)
 * @param {String} price The inputted price that we need to convert
 */
export const filteredVariantPrice = (price, side) => {
  if ('right' === side) {
    return price.substring(price.length, price.indexOf('-')).replace('-', '');
  }
  return price.substring(0, price.indexOf('-')).replace('-', '');
};

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
 * Returns cart data in the required format.
 * @param {String} data Cart data
 */
export const getFormattedCart = (data) => {
  let formattedCart = null;
  if (!data || !data.cart.contents.nodes.length || !data.cart) {
    return formattedCart;
  }
  const givenProducts = data.cart.contents.nodes;
  // Create an empty object.
  formattedCart = {};
  formattedCart.products = [];
  let totalProductsCount = 0;
  let i = 0;
  givenProducts.forEach(() => {
    const givenProduct = givenProducts[parseInt(i, 10)].product;
    const product = {};
    // Convert price to a float value
    const convertedCurrency = givenProducts[parseInt(i, 10)].total.replace(
      /[^0-9.-]+/g,
      ''
    );

    product.productId = givenProduct.productId;
    product.cartKey = givenProducts[parseInt(i, 10)].key;
    product.name = givenProduct.name;
    product.qty = givenProducts[parseInt(i, 10)].quantity;
    product.price = convertedCurrency / product.qty;
    product.totalPrice = givenProducts[parseInt(i, 10)].total;
    // Ensure we can add products without images to the cart
    product.image = givenProduct.image
      ? {
          sourceUrl: givenProduct.image.sourceUrl,
          srcSet: givenProduct.image.srcSet,
          title: givenProduct.image.title,
        }
      : {
          sourceUrl: process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL,
          srcSet: process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL,
          title: givenProduct.name,
        };

    totalProductsCount += givenProducts[parseInt(i, 10)].quantity;
    // Push each item into the products array.
    formattedCart.products.push(product);
    i++;
  });
  formattedCart.totalProductsCount = totalProductsCount;
  formattedCart.totalProductsPrice = data.cart.total;
  return formattedCart;
};

export const createCheckoutData = (order) => ({
  clientMutationId: uuidv4(),
  billing: {
    firstName: order.firstName,
    lastName: order.lastName,
    address1: order.address1,
    address2: order.address2,
    city: order.city,
    country: order.country,
    state: order.state,
    postcode: order.postcode,
    email: order.email,
    phone: order.phone,
    company: order.company,
  },
  shipping: {
    firstName: order.firstName,
    lastName: order.lastName,
    address1: order.address1,
    address2: order.address2,
    city: order.city,
    country: order.country,
    state: order.state,
    postcode: order.postcode,
    email: order.email,
    phone: order.phone,
    company: order.company,
  },
  shipToDifferentAddress: false,
  paymentMethod: order.paymentMethod,
  isPaid: false,
  transactionId: 'hjkhjkhsdsdiui',
});

/**
 * Get the updated items in the below format required for mutation input.
 *
 * [
 * { "key": "33e75ff09dd601bbe6dd51039152189", "quantity": 1 },
 * { "key": "02e74f10e0327ad868d38f2b4fdd6f0", "quantity": 1 },
 * ]
 *
 * Creates an array in above format with the newQty (updated Qty ).
 *
 */
export const getUpdatedItems = (products, newQty, cartKey) => {
  // Create an empty array.
  const updatedItems = [];

  // Loop through the product array.
  products.map((cartItem) => {
    // If you find the cart key of the product user is trying to update, push the key and new qty.
    if (cartItem.cartKey === cartKey) {
      updatedItems.push({
        key: cartItem.cartKey,
        quantity: parseInt(newQty, 10),
      });

      // Otherwise just push the existing qty without updating.
    } else {
      updatedItems.push({
        key: cartItem.cartKey,
        quantity: cartItem.qty,
      });
    }
  });

  // Return the updatedItems array with new Qtys.
  return updatedItems;
};
