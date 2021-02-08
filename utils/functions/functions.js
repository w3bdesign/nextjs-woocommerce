import { v4 as uuidv4 } from 'uuid';

import WOO_CONFIG from 'utils/config/nextConfig';

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
  return newCart;
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

/**
 * Update cart when we add a new product to it
 * @param {Object} existingCart
 * @param {Object} product
 * @param {Number} quantityToBeAdded
 */
export const updateCart = (
  existingCart,
  product,
  quantityToBeAdded,
  newQuantity = false
) => {
  getUpdatedProducts(
    existingCart.products,
    product,
    quantityToBeAdded,
    newQuantity
  );
};

/**
 * Get updated products array
 * Update the product if it exists else,
 * add the new product to existing cart,
 *
 * @param {Object} existingProductsInCart Existing product in cart
 * @param {Object} product Product
 * @param {Integer} qtyToBeAdded Quantity
 * @param {Integer} newQty New qty of the product (optional)
 * @return {*[]}
 */
export const getUpdatedProducts = (
  existingProductsInCart,
  product,
  qtyToBeAdded,
  newQty = false
) => {
  // Check if the product already exits in the cart.
  const productExitsIndex = isProductInCart(
    existingProductsInCart,
    product.productId
  );

  // If product exists ( index of that product was found in the array ), update the product quantity and totalPrice
  if (-1 < productExitsIndex) {
    let updatedProducts = existingProductsInCart;
    let updatedProduct = updatedProducts[productExitsIndex];

    // If have new quantity of the product available, set that, else add the qtyToBeAdded
    updatedProduct.qty = newQty
      ? parseInt(newQty)
      : parseInt(updatedProduct.qty + qtyToBeAdded);
    updatedProduct.totalPrice = parseFloat(
      (updatedProduct.price * updatedProduct.qty).toFixed(2)
    );

    return updatedProducts;
  }
  // If product not found push the new product to the existing product array.
  let productPrice = getFloatVal(product.price);
  const newProduct = createNewProduct(product, productPrice, qtyToBeAdded);
  existingProductsInCart.push(newProduct);

  return existingProductsInCart;
};

/**
 * Returns index of the product if it exists.
 *
 * @param {Object} existingProductsInCart Existing Products.
 * @param {Integer} productId Product id.
 * @return {number | *} Index Returns -1 if product does not exist in the array, index number otherwise
 */
const isProductInCart = (existingProductsInCart, productId) => {
  const returnItemThatExits = (item, index) => {
    if (productId === item.productId) {
      return item;
    }
  };

  // This new array will only contain the product which is matched.
  const newArray = existingProductsInCart.filter(returnItemThatExits);

  return existingProductsInCart.indexOf(newArray[0]);
};

/**
 * Remove item from the cart.
 *
 * @param {Integer} productId Product Id.
 * @return {any | string} Updated cart
 */
export const removeItemFromCart = (productId) => {
  let existingCart = localStorage.getItem('woo-next-cart');
  existingCart = JSON.parse(existingCart);

  // If there is only one item in the cart, delete the cart.
  if (1 === existingCart.products.length) {
    localStorage.removeItem('woo-next-cart');
    return null;
  }

  // Check if the product already exits in the cart.
  const productExitsIndex = isProductInCart(existingCart.products, productId);

  // If product to be removed exits
  if (-1 < productExitsIndex) {
    const productTobeRemoved = existingCart.products[productExitsIndex];
    const qtyToBeRemovedFromTotal = productTobeRemoved.qty;
    const priceToBeDeductedFromTotal = productTobeRemoved.totalPrice;

    // Remove that product from the array and update the total price and total quantity of the cart
    let updatedCart = existingCart;
    updatedCart.products.splice(productExitsIndex, 1);
    updatedCart.totalProductsCount =
      updatedCart.totalProductsCount - qtyToBeRemovedFromTotal;
    updatedCart.totalProductsPrice =
      updatedCart.totalProductsPrice - priceToBeDeductedFromTotal;

    localStorage.setItem('woo-next-cart', JSON.stringify(updatedCart));
    return updatedCart;
  } else {
    return existingCart;
  }
};

/**
 * Returns cart data in the required format.
 * @param {String} data Cart data
 */
export const getFormattedCart = (data) => {
  let formattedCart = null;

  if (undefined === data || !data.cart.contents.nodes.length) {
    return formattedCart;
  }

  const givenProducts = data.cart.contents.nodes;

  // Create an empty object.
  formattedCart = {};
  formattedCart.products = [];
  let totalProductsCount = 0;

  let i = 0;
  givenProducts.forEach(() => {
    const givenProduct = givenProducts[i].product;
    const product = {};
    // Convert price to a float value
    const convertedCurrency = givenProducts[i].total.replace(/[^0-9.-]+/g, '');

    product.productId = givenProduct.productId;
    product.cartKey = givenProducts[i].key;
    product.name = givenProduct.name;
    product.qty = givenProducts[i].quantity;
    product.price = convertedCurrency / product.qty;
    product.totalPrice = givenProducts[i].total;
    // Ensure we can add products without images to the cart
    givenProduct.image
      ? (product.image = {
          sourceUrl: givenProduct.image.sourceUrl,
          srcSet: givenProduct.image.srcSet,
          title: givenProduct.image.title,
        })
      : (product.image = {
          sourceUrl: WOO_CONFIG.PLACEHOLDER_SMALL_IMAGE_URL,
          srcSet: WOO_CONFIG.PLACEHOLDER_SMALL_IMAGE_URL,
          title: givenProduct.name,
        });

    totalProductsCount += givenProducts[i].quantity;
    // Push each item into the products array.
    formattedCart.products.push(product);
    i++;
  });

  formattedCart.totalProductsCount = totalProductsCount;
  formattedCart.totalProductsPrice = data.cart.total;
  return formattedCart;
};

export const createCheckoutData = (order) => {
  const checkoutData = {
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
  };

  return checkoutData;
};

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
        quantity: parseInt(newQty),
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
