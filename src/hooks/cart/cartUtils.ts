/**
 * Private helpers for the Cart module (see useCart).
 * These shape WooCommerce GraphQL responses into the client-side Cart
 * and build mutation inputs. They are implementation details of useCart()
 * and should not be imported directly by components.
 */

import type { CartProduct, Cart } from '@/types/cart';
import type { IUpdateCartItem, IFormattedCartProps } from '@/types/graphql';

/**
 * Convert a WooCommerce cart GraphQL response into the client-side Cart shape.
 * Returns undefined when the cart is empty so callers can treat "empty" and
 * "no data" uniformly.
 * @param {IFormattedCartProps} data Cart data from the GET_CART query
 */
export const getFormattedCart = (
  data: IFormattedCartProps | undefined,
): Cart | undefined => {
  if (!data?.cart?.contents?.nodes?.length) {
    return undefined;
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

/**
 * Build the items array for the UPDATE_CART mutation: keep every existing
 * quantity, overriding only the line item identified by cartKey.
 *
 * Derives from the same formatted `CartProduct[]` the UI renders from, so the
 * mutation input can never disagree with what the user sees (one source of
 * truth instead of reading a parallel Apollo query result).
 */
export const getUpdatedItems = (
  products: CartProduct[],
  newQty: number,
  cartKey: string,
): IUpdateCartItem[] =>
  products.map((item) => ({
    key: item.cartKey,
    quantity: item.cartKey === cartKey ? newQty : item.qty,
  }));
