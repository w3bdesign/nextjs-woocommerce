/*eslint complexity: ["error", 20]*/

import { v4 as uuidv4 } from 'uuid';
import { ChangeEvent } from 'react';

import type { CartProduct, Cart } from '@/types/cart';
import type { ICheckoutDataProps } from '@/types/checkout';
import type {
  ICartItemNode,
  IUpdateCartItem,
  IUpdateCartInput,
  IUpdateCartVariables,
  IUpdateCartMutationArgs,
  IFormattedCartProps,
} from '@/types/graphql';

// Re-export types that other files import from here
export type {
  ICartItemNode,
  ICheckoutDataProps,
  IUpdateCartItem,
  IUpdateCartInput,
  IUpdateCartVariables,
  IUpdateCartMutationArgs,
};

// Keep backward-compatible alias for IProductRootObject → ICartItemNode
export type IProductRootObject = ICartItemNode;
export type IUpdateCartRootObject = IUpdateCartMutationArgs;

type TUpdatedItems = { key: string; quantity: number }[];

/**
 * Add empty character after currency symbol
 * @param {string} price The price string that we input
 * @param {string} symbol Currency symbol to add empty character/padding after
 */

export const paddedPrice = (price: string, symbol: string) =>
  price.split(symbol).join(`${symbol} `);

/**
 * Shorten inputted string (usually product description) to a maximum of length
 * @param {string} input The string that we input
 * @param {number} length The length that we want to shorten the text to
 */
export const trimmedStringToLength = (input: string, length: number) => {
  if (input.length > length) {
    const subStr = input.substring(0, length);
    return `${subStr}...`;
  }
  return input;
};

/**
 * Filter variant price. Changes "kr198.00 - kr299.00" to kr299.00 or kr198 depending on the side variable
 * @param {String} side Which side of the string to return (which side of the "-" symbol)
 * @param {String} price The inputted price that we need to convert
 */
export const filteredVariantPrice = (price: string, side: string) => {
  if ('right' === side) {
    return price.substring(price.length, price.indexOf('-')).replace('-', '');
  }

  return price.substring(0, price.indexOf('-')).replace('-', '');
};

/**
 * Returns cart data in the required format.
 * @param {IFormattedCartProps} data Cart data from GraphQL
 */

export const getFormattedCart = (data: IFormattedCartProps) => {
  if (!data?.cart?.contents?.nodes?.length) {
    return;
  }

  const givenProducts = data.cart.contents.nodes;

  const formattedCart: Cart = {
    products: [],
    totalProductsCount: 0,
    totalProductsPrice: 0,
  };

  let totalProductsCount = 0;

  givenProducts.forEach((item) => {
    const givenProduct = item.product.node;

    // Convert price to a float value
    const convertedCurrency = item.total.replace(/[^0-9.-]+/g, '');

    // Create a new product object for each item to avoid shared reference bug
    const product: CartProduct = {
      productId: givenProduct.productId,
      cartKey: item.key,
      name: givenProduct.name,
      qty: item.quantity,
      price: Number(convertedCurrency) / item.quantity,
      totalPrice: item.total,
      image: givenProduct.image?.sourceUrl
        ? {
            sourceUrl: givenProduct.image.sourceUrl,
            srcSet: givenProduct.image.srcSet,
            title: givenProduct.image.title,
          }
        : {
            sourceUrl: process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL,
            srcSet: process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL,
            title: givenProduct.name,
          },
    };

    totalProductsCount += item.quantity;
    formattedCart.products.push(product);
  });

  formattedCart.totalProductsCount = totalProductsCount;
  formattedCart.totalProductsPrice = data.cart.total;

  return formattedCart;
};

export const createCheckoutData = (order: ICheckoutDataProps) => ({
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
  transactionId: uuidv4(),
});

/**
 * Get the updated items in the below format required for mutation input.
 *
 * Creates an array in above format with the newQty (updated Qty ).
 *
 */
export const getUpdatedItems = (
  products: ICartItemNode[],
  newQty: number,
  cartKey: string,
) => {
  const updatedItems: TUpdatedItems = products.map((cartItem) => ({
    key: cartItem.key,
    quantity: cartItem.key === cartKey ? newQty : cartItem.quantity,
  }));

  return updatedItems;
};

/*
 * When user changes the quantity, update the cart in localStorage
 * Also update the cart in the global Context
 */
export const handleQuantityChange = (
  event: ChangeEvent<HTMLInputElement>,
  cartKey: string,
  cart: ICartItemNode[],
  updateCart: (variables: IUpdateCartMutationArgs) => void,
  updateCartProcessing: boolean,
) => {
  if (typeof window !== 'undefined') {
    event.stopPropagation();

    // Return if the previous update cart mutation request is still processing
    if (updateCartProcessing || !cart) {
      return;
    }

    // If the user tries to delete the count of product, set that to 1 by default ( This will not allow him to reduce it less than zero )
    const newQty = event.target.value ? parseInt(event.target.value, 10) : 1;

    if (cart.length) {
      const updatedItems = getUpdatedItems(cart, newQty, cartKey);

      updateCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            items: updatedItems,
          },
        },
      });
    }
  }
};
