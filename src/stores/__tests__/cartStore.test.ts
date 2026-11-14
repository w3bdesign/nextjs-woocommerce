import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from '@/stores/cartStore';
import type { Cart } from '@/stores/cartStore';

const cart: Cart = {
  products: [
    {
      productId: 13,
      cartKey: 'key-13',
      name: 'Test Simple',
      qty: 2,
      price: 699,
      totalPrice: 'kr1 398,00',
      image: { sourceUrl: '/a.jpg', srcSet: '', title: 'Test Simple' },
    },
  ],
  totalProductsCount: 2,
  totalProductsPrice: 1398,
} as Cart;

const CART_KEY = 'woocommerce-cart:v1';
const SESSION_KEY = 'woo-session:v1';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: null, isLoading: false });
    localStorage.clear();
  });

  it('starts with an empty cart', () => {
    expect(useCartStore.getState().cart).toBeNull();
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it('setCart replaces the cart without writing the WooCommerce key', () => {
    useCartStore.getState().setCart(cart);
    expect(useCartStore.getState().cart).toEqual(cart);
    expect(localStorage.getItem(CART_KEY)).toBeNull();
  });

  it('updateCart stores the cart in state and localStorage', () => {
    useCartStore.getState().updateCart(cart);
    expect(useCartStore.getState().cart).toEqual(cart);
    expect(JSON.parse(localStorage.getItem(CART_KEY) ?? 'null')).toEqual(cart);
  });

  it('syncWithWooCommerce stores the cart in state and localStorage', () => {
    useCartStore.getState().syncWithWooCommerce(cart);
    expect(useCartStore.getState().cart).toEqual(cart);
    expect(JSON.parse(localStorage.getItem(CART_KEY) ?? 'null')).toEqual(cart);
  });

  it('clearWooCommerceSession empties the cart and removes both keys', () => {
    useCartStore.getState().updateCart(cart);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'abc' }));

    useCartStore.getState().clearWooCommerceSession();

    expect(useCartStore.getState().cart).toBeNull();
    expect(localStorage.getItem(CART_KEY)).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('persists only the cart under "cart-store"', () => {
    useCartStore.setState({ isLoading: true });
    useCartStore.getState().setCart(cart);

    const persisted = JSON.parse(localStorage.getItem('cart-store') ?? '{}');
    expect(persisted.state).toEqual({ cart });
  });
});
