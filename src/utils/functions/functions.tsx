/*eslint complexity: ["error", 20]*/

import type { CartContentNode, CartItem, GetCartQuery } from '@/types/cart';
import type { FamilyVariant, ModelFamily } from '@/types/configurator';
import { ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface RootObject {
  products: CartItem[];
  totalProductsCount: number;
  totalProductsPrice: number;
}

type TUpdatedItems = { key: string; quantity: number }[];

export interface IUpdateCartItem {
  key: string;
  quantity: number;
}

export interface IUpdateCartInput {
  clientMutationId: string;
  items: IUpdateCartItem[];
}

export interface IUpdateCartVariables {
  input: IUpdateCartInput;
}

export interface IUpdateCartRootObject {
  variables: IUpdateCartVariables;
}

/* Interface for props */

// Removed IFormattedCartProps; callers use `GetCartQuery` / `CartContentNode` types.

export interface ICheckoutDataProps {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  country: string;
  state: string;
  postcode: string;
  email: string;
  phone: string;
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

export const getFormattedCart = (data?: GetCartQuery) => {
  const formattedCart: RootObject = {
    products: [],
    totalProductsCount: 0,
    totalProductsPrice: 0,
  };

  if (!data) {
    return;
  }

  const givenProducts: CartContentNode[] = data.cart?.contents?.nodes ?? [];

  formattedCart.products = [];

  let totalProductsCount = 0;

  if (!givenProducts.length) {
    return;
  }

  givenProducts.forEach((node) => {
    const givenProduct = node.product?.node;

    // Convert price to a float value
    const convertedCurrency = String(node.total ?? '0').replace(
      /[^0-9.-]+/g,
      '',
    );

    const qty = Number(node.quantity) || 1;
    const price = qty ? Number(convertedCurrency) / qty : 0;
    const totalPrice = Number(convertedCurrency) || 0;

    const cartItem: CartItem = {
      cartKey: node.key ?? `${givenProduct?.databaseId ?? '0'}-${uuidv4()}`,
      name: givenProduct?.name ?? 'Product',
      qty,
      price,
      totalPrice,
      image: givenProduct?.image?.sourceUrl
        ? {
            sourceUrl: givenProduct.image.sourceUrl,
            srcSet: givenProduct.image.srcSet,
            title: givenProduct.image.title,
          }
        : {
            sourceUrl: process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL,
            title: givenProduct?.name ?? 'Product',
          },
      productId: givenProduct?.databaseId ?? 0,
    } as CartItem;

    totalProductsCount += qty;
    formattedCart.products.push(cartItem);
  });

  formattedCart.totalProductsCount = totalProductsCount;
  formattedCart.totalProductsPrice = Number(data.cart?.total ?? 0);

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
  products: CartContentNode[],
  newQty: number,
  cartKey: string,
) => {
  // Create an empty array.
  const updatedItems: TUpdatedItems = [];

  // Loop through the product array and only include nodes that have a valid key
  products.forEach((cartItem) => {
    if (!cartItem || !cartItem.key) return;

    const existingQty = Number(cartItem.quantity ?? 1);

    if (cartItem.key === cartKey) {
      updatedItems.push({ key: cartItem.key, quantity: Number(newQty) });
    } else {
      updatedItems.push({ key: cartItem.key, quantity: existingQty });
    }
  });

  return updatedItems;
};

/*
 * When user changes the quantity, update the cart in localStorage
 * Also update the cart in the global Context
 */
export const handleQuantityChange = (
  event: ChangeEvent<HTMLInputElement>,
  cartKey: string,
  cart: CartContentNode[],
  updateCart: (variables: IUpdateCartRootObject) => void,
  updateCartProcessing: boolean,
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

/**
 * Serializes the configurator state to a JSON string for cart storage
 * @param configuratorState - The current configurator state from Valtio
 * @returns JSON string containing configuration data
 *
 * Version 2.0 includes family-based variant system fields:
 * - familyId: Product family identifier
 * - activeVariantId: Current variant within the family
 * - variantDisplayName: Human-readable variant name for display
 * - modelName: Model display name (from ModelConfig)
 *
 * Backend can reconstruct full variant metadata from variantId.
 * Omits constraints/modelPath to minimize cart storage overhead.
 */
export interface SerializedConfiguratorState {
  items: Record<string, string>;
  dimensions: { length: number; width: number; height: number };
  interactiveStates: Record<string, boolean>;
  timestamp: string;
  version: string;
  familyId?: string;
  activeVariantId?: string;
  variantDisplayName?: string;
  modelName?: string;
}

export const serializeConfiguratorState = (configuratorState: {
  items: Record<string, string>;
  dimensions: { length: number; width: number; height: number };
  interactiveStates: Record<string, boolean>;
  productId?: number | null;
  familyId?: string | null;
  activeVariantId?: string;
}): string => {
  // Determine version based on family system usage
  const version = configuratorState.familyId ? '2.0' : '1.0';

  // Base configuration data (compatible with v1.0)
  const configData: SerializedConfiguratorState = {
    items: configuratorState.items,
    dimensions: configuratorState.dimensions,
    interactiveStates: configuratorState.interactiveStates,
    timestamp: new Date().toISOString(),
    version,
  };

  // Add family-based fields for version 2.0
  if (version === '2.0' && configuratorState.familyId) {
    configData.familyId = configuratorState.familyId;
    configData.activeVariantId = configuratorState.activeVariantId || '';

    // Get variant display name and model name from registry
    try {
      const { getModelFamily } = require('@/config/families.registry');
      const { getModelConfig } = require('@/config/models.registry');

      const family: ModelFamily | undefined = getModelFamily(
        configuratorState.familyId,
      );
      if (family && configuratorState.activeVariantId) {
        const variant: FamilyVariant | undefined = family.variants.find(
          (v) => v.id === configuratorState.activeVariantId,
        );
        if (variant) {
          configData.variantDisplayName = variant.displayName;

          // Get model name from ModelConfig for order display
          const modelConfig = getModelConfig(variant.modelId);
          if (modelConfig) {
            configData.modelName = modelConfig.name;
          }
        }
      }
    } catch (error) {
      // Graceful fallback if registry access fails
      console.warn(
        '[serializeConfiguratorState] Failed to load variant metadata:',
        error,
      );
    }
  }

  return JSON.stringify(configData);
};
