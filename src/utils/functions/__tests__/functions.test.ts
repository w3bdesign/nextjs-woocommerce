import type { ChangeEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  createCheckoutData,
  filteredVariantPrice,
  getFormattedCart,
  getUpdatedItems,
  handleQuantityChange,
  trimmedStringToLength,
} from '@/utils/functions/functions';
import type { ICartItemNode, ICheckoutDataProps } from '@/utils/functions/functions';
import type { IFormattedCartProps } from '@/types/graphql';

const cartItem = (
  key: string,
  quantity: number,
  total: string,
  overrides: { name?: string; sourceUrl?: string } = {},
): ICartItemNode =>
  ({
    __typename: 'SimpleCartItem',
    key,
    quantity,
    total,
    subtotal: total,
    subtotalTax: 'kr0.00',
    product: {
      __typename: 'CartItemToProductConnectionEdge',
      node: {
        productId: Number(key.replace(/\D/g, '')) || 1,
        name: overrides.name ?? `Product ${key}`,
        image: overrides.sourceUrl
          ? { sourceUrl: overrides.sourceUrl, srcSet: 'srcset', title: 'title' }
          : null,
      },
    },
  }) as unknown as ICartItemNode;

describe('trimmedStringToLength', () => {
  it('returns short strings unchanged', () => {
    expect(trimmedStringToLength('Hello', 10)).toBe('Hello');
    expect(trimmedStringToLength('Hello', 5)).toBe('Hello');
  });

  it('truncates long strings and appends an ellipsis', () => {
    expect(trimmedStringToLength('Hello world', 5)).toBe('Hello...');
  });
});

describe('filteredVariantPrice', () => {
  const range = 'kr198.00 - kr299.00';

  it('returns the left side of a price range by default', () => {
    expect(filteredVariantPrice(range, '').trim()).toBe('kr198.00');
  });

  it('returns the right side when side is "right"', () => {
    expect(filteredVariantPrice(range, 'right').trim()).toBe('kr299.00');
  });
});

describe('getFormattedCart', () => {
  it('returns undefined for an empty or missing cart', () => {
    expect(getFormattedCart(undefined as unknown as IFormattedCartProps)).toBeUndefined();
    expect(
      getFormattedCart({ cart: { contents: { nodes: [] }, total: 0 } }),
    ).toBeUndefined();
  });

  it('formats products, totals and unit prices', () => {
    const data = {
      cart: {
        contents: {
          nodes: [
            cartItem('key1', 2, 'kr1 398,00', { sourceUrl: '/a.jpg' }),
            cartItem('key2', 1, 'kr199.00', { sourceUrl: '/b.jpg' }),
          ],
        },
        total: 'kr1 597,00',
      },
    } as unknown as IFormattedCartProps;

    const cart = getFormattedCart(data);

    expect(cart?.totalProductsCount).toBe(3);
    expect(cart?.totalProductsPrice).toBe(1597);
    expect(cart?.products).toHaveLength(2);
    expect(cart?.products[0]).toMatchObject({
      cartKey: 'key1',
      name: 'Product key1',
      qty: 2,
      price: 699,
      totalPrice: 'kr1 398,00',
      image: { sourceUrl: '/a.jpg', srcSet: 'srcset', title: 'title' },
    });
    expect(cart?.products[1].price).toBe(199);
  });

  it('creates independent product objects (no shared references)', () => {
    const data = {
      cart: {
        contents: {
          nodes: [cartItem('key1', 1, '100'), cartItem('key2', 1, '200')],
        },
        total: '300',
      },
    } as unknown as IFormattedCartProps;

    const cart = getFormattedCart(data);
    expect(cart?.products[0]).not.toBe(cart?.products[1]);
    expect(cart?.products.map((p) => p.cartKey)).toEqual(['key1', 'key2']);
  });

  it('falls back to the placeholder image and product name as title', () => {
    vi.stubEnv('NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL', '/placeholder.jpg');
    const data = {
      cart: {
        contents: { nodes: [cartItem('key1', 1, '100', { name: 'No image' })] },
        total: '100',
      },
    } as unknown as IFormattedCartProps;

    expect(getFormattedCart(data)?.products[0].image).toEqual({
      sourceUrl: '/placeholder.jpg',
      srcSet: '/placeholder.jpg',
      title: 'No image',
    });
    vi.unstubAllEnvs();
  });
});

describe('createCheckoutData', () => {
  const order = {
    firstName: 'Ola',
    lastName: 'Nordmann',
    address1: 'Karl Johans gate 1',
    address2: '',
    city: 'Oslo',
    country: 'NO',
    state: '',
    postcode: '0154',
    email: 'ola@example.com',
    phone: '12345678',
    company: '',
    paymentMethod: 'cod',
  } as ICheckoutDataProps;

  it('uses the same address for billing and shipping', () => {
    const data = createCheckoutData(order);
    expect(data.billing).toEqual(data.shipping);
    expect(data.billing).toMatchObject({
      firstName: 'Ola',
      lastName: 'Nordmann',
      city: 'Oslo',
      postcode: '0154',
      email: 'ola@example.com',
    });
  });

  it('sets payment fields and unique ids', () => {
    const data = createCheckoutData(order);
    expect(data).toMatchObject({
      paymentMethod: 'cod',
      isPaid: false,
      shipToDifferentAddress: false,
    });
    expect(data.clientMutationId).toEqual(expect.any(String));
    expect(data.transactionId).toEqual(expect.any(String));
    expect(data.clientMutationId).not.toBe(data.transactionId);
  });
});

describe('getUpdatedItems', () => {
  const items = [cartItem('a', 1, '100'), cartItem('b', 3, '300')];

  it('changes only the quantity of the matching cart key', () => {
    expect(getUpdatedItems(items, 5, 'b')).toEqual([
      { key: 'a', quantity: 1 },
      { key: 'b', quantity: 5 },
    ]);
  });

  it('supports removing a line with quantity 0', () => {
    expect(getUpdatedItems(items, 0, 'a')).toEqual([
      { key: 'a', quantity: 0 },
      { key: 'b', quantity: 3 },
    ]);
  });

  it('leaves all quantities unchanged for an unknown key', () => {
    expect(getUpdatedItems(items, 9, 'missing')).toEqual([
      { key: 'a', quantity: 1 },
      { key: 'b', quantity: 3 },
    ]);
  });
});

describe('handleQuantityChange', () => {
  const items = [cartItem('a', 1, '100')];
  const event = (value: string) =>
    ({
      stopPropagation: vi.fn(),
      target: { value },
    }) as unknown as ChangeEvent<HTMLInputElement>;

  it('calls updateCart with the new quantity', () => {
    const updateCart = vi.fn();
    const changeEvent = event('4');
    handleQuantityChange(changeEvent, 'a', items, updateCart, false);

    expect(changeEvent.stopPropagation).toHaveBeenCalled();
    expect(updateCart).toHaveBeenCalledWith({
      variables: {
        input: {
          clientMutationId: expect.any(String),
          items: [{ key: 'a', quantity: 4 }],
        },
      },
    });
  });

  it('defaults an empty value to quantity 1', () => {
    const updateCart = vi.fn();
    handleQuantityChange(event(''), 'a', items, updateCart, false);
    expect(updateCart.mock.calls[0][0].variables.input.items).toEqual([
      { key: 'a', quantity: 1 },
    ]);
  });

  it('does nothing while a previous update is processing', () => {
    const updateCart = vi.fn();
    handleQuantityChange(event('2'), 'a', items, updateCart, true);
    expect(updateCart).not.toHaveBeenCalled();
  });

  it('does nothing for an empty cart', () => {
    const updateCart = vi.fn();
    handleQuantityChange(event('2'), 'a', [], updateCart, false);
    expect(updateCart).not.toHaveBeenCalled();
  });
});
