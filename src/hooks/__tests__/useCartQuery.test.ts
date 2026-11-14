import { renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCartQuery } from '@/hooks/useCartQuery';
import { useCartStore } from '@/stores/cartStore';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
}));

const cartData = (quantity: number) => ({
  cart: {
    total: `kr${699 * quantity}.00`,
    contents: {
      nodes: quantity
        ? [
            {
              key: 'key-13',
              quantity,
              total: `kr${699 * quantity}.00`,
              product: { node: { productId: 13, name: 'Test Simple', image: null } },
            },
          ]
        : [],
    },
  },
});

const mockQuery = (result: Record<string, unknown>) =>
  vi.mocked(useQuery).mockReturnValue({
    data: undefined,
    loading: false,
    error: undefined,
    refetch: vi.fn(),
    ...result,
  } as never);

const existingCart = {
  products: [],
  totalProductsCount: 9,
  totalProductsPrice: 9,
};

describe('useCartQuery', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: null });
  });

  it('queries the cart and returns the query result', () => {
    const refetch = vi.fn();
    mockQuery({ refetch });

    const { result } = renderHook(() => useCartQuery());

    expect(useQuery).toHaveBeenCalledWith(GET_CART, { notifyOnNetworkStatusChange: true });
    expect(result.current.refetch).toBe(refetch);
  });

  it('syncs a filled cart into the store', () => {
    mockQuery({ data: cartData(2) });
    renderHook(() => useCartQuery());

    const { cart } = useCartStore.getState();
    expect(cart?.totalProductsCount).toBe(2);
    expect(cart?.products[0]).toMatchObject({ cartKey: 'key-13', qty: 2 });
  });

  it.each([
    ['loading', { loading: true, data: cartData(2) }],
    ['errored', { error: new Error('boom'), data: cartData(2) }],
    ['missing', { data: { cart: null } }],
  ])('leaves the store alone while the result is %s', (_state, result) => {
    useCartStore.setState({ cart: existingCart });
    mockQuery(result);
    renderHook(() => useCartQuery({ clearEmptyCart: true }));

    expect(useCartStore.getState().cart).toEqual(existingCart);
  });

  it('clears the session for an empty cart when clearEmptyCart is set', () => {
    useCartStore.setState({ cart: existingCart });
    localStorage.setItem('woo-session:v1', '{"token":"abc"}');
    mockQuery({ data: cartData(0) });

    renderHook(() => useCartQuery({ clearEmptyCart: true }));

    expect(useCartStore.getState().cart).toBeNull();
    expect(localStorage.getItem('woo-session:v1')).toBeNull();
  });

  it('keeps the stored cart for an empty result by default', () => {
    useCartStore.setState({ cart: existingCart });
    mockQuery({ data: cartData(0) });

    renderHook(() => useCartQuery());

    expect(useCartStore.getState().cart).toEqual(existingCart);
  });
});
