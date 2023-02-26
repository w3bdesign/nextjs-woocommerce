/*eslint complexity: ["error", 20]*/

import { v4 as uuidv4 } from 'uuid';

import { RootObject, Product } from '@/utils/context/CartProvider';

import { ChangeEvent } from 'react';

/* Interface for products*/

export interface IImage {
  __typename: string;
  id: string;
  sourceUrl?: string;
  srcSet?: string;
  altText: string;
  title: string;
}

export interface IGalleryImages {
  __typename: string;
  nodes: any[];
}

interface IProductNode {
  __typename: string;
  id: string;
  databaseId: number;
  name: string;
  description: string;
  type: string;
  onSale: boolean;
  slug: string;
  averageRating: number;
  reviewCount: number;
  image: IImage;
  galleryImages: IGalleryImages;
  productId: number;
}

interface IProduct {
  __typename: string;
  node: IProductNode;
}

export interface IProductRootObject {
  __typename: string;
  key: string;
  product: IProduct;
  variation?: any;
  quantity: number;
  total: string;
  subtotal: string;
  subtotalTax: string;
}

type TUpdatedItems = { key: string; quantity: number }[];

/* Interface for props */

interface IFormattedCartProps {
  cart: { contents: { nodes: IProductRootObject[] }; total: number };
}

export interface ICheckoutDataProps {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  country: string;
  state: string;
  postcode: number;
  email: string;
  phone: number;
  company: string;
  paymentMethod: string;
}

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
 * @param {String} data Cart data
 */

export const getFormattedCart = (data: IFormattedCartProps) => {
  const formattedCart: RootObject = {
    products: [],
    totalProductsCount: 0,
    totalProductsPrice: 0,
  };

  if (!data) {
    return;
  }
  const givenProducts = data.cart.contents.nodes;

  // Create an empty object.
  formattedCart.products = [];

  const product: Product = {
    productId: 0,
    cartKey: '',
    name: '',
    qty: 0,
    price: 0,
    totalPrice: '0',
    image: { sourceUrl: '', srcSet: '', title: '' },
  };

  let totalProductsCount = 0;
  let i = 0;

  if (!givenProducts.length) {
    return;
  }

  givenProducts.forEach(() => {
    const givenProduct = givenProducts[Number(i)].product.node;

    // Convert price to a float value
    const convertedCurrency = givenProducts[Number(i)].total.replace(/[^0-9.-]+/g, '');

    product.productId = givenProduct.productId;
    product.cartKey = givenProducts[Number(i)].key;
    product.name = givenProduct.name;
    product.qty = givenProducts[Number(i)].quantity;
    product.price = Number(convertedCurrency) / product.qty;
    product.totalPrice = givenProducts[Number(i)].total;

    // Ensure we can add products without images to the cart

    product.image = givenProduct.image.sourceUrl
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

    totalProductsCount += givenProducts[Number(i)].quantity;

    // Push each item into the products array.
    formattedCart.products.push(product);
    i++;
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
  transactionId: 'fhggdfjgfi',
});

/**
 * Get the updated items in the below format required for mutation input.
 *
 * Creates an array in above format with the newQty (updated Qty ).
 *
 */
export const getUpdatedItems = (
  products: IProductRootObject[],
  newQty: number,
  cartKey: string
) => {
  // Create an empty array.

  const updatedItems: TUpdatedItems = [];

  // Loop through the product array.
  products.forEach((cartItem) => {
    // If you find the cart key of the product user is trying to update, push the key and new qty.
    if (cartItem.key === cartKey) {
      updatedItems.push({
        key: cartItem.key,
        quantity: newQty,
      });

      // Otherwise just push the existing qty without updating.
    } else {
      updatedItems.push({
        key: cartItem.key,
        quantity: cartItem.quantity,
      });
    }
  });

  // Return the updatedItems array with new Qtys.
  return updatedItems;
};

/*
 * When user changes the quantity, update the cart in localStorage
 * Also update the cart in the global Context
 */
export const handleQuantityChange = (
  event: ChangeEvent<HTMLInputElement>,
  cartKey: string,
  cart: IProductRootObject[],
  updateCart: any, // Lazy solution, but saves us from a lot of warnings
  updateCartProcessing: boolean
) => {
  if (process.browser) {
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
