import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { useMutation } from '@apollo/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCart } from '@/hooks/useCart';
import { useCartQuery } from '@/hooks/useCartQuery';
import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

vi.mock('@/hooks/useCartQuery', () => ({ useCartQuery: vi.fn() }));
vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
}));

const nodes = [
  { key: 'a', quantity: 1 },
  { key: 'b', quantity: 2 },
];

const setup = ({
  data = { cart: { total: 'kr300.00', contents: { nodes } } } as unknown,
  loading = false,
  isUpdating = false,
} = {}) => {
  const refetch = vi.fn();
  const updateCart = vi.fn();
  vi.mocked(useCartQuery).mockReturnValue({ data, loading, refetch } as never);
  vi.mocked(useMutation).mockReturnValue([updateCart, { loading: isUpdating }] as never);
  const hook = renderHook(() => useCart());
  return { ...hook, refetch, updateCart };
};

const mutationOptions = () => vi.mocked(useMutation).mock.calls[0][1] as {
  onCompleted: () => void;
};

describe('useCart', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.mocked(useMutation).mockReset();
  });

  it('asks for a fresh cart (clearing empty carts) on mount', () => {
    const { refetch } = setup();
    expect(useCartQuery).toHaveBeenCalledWith({ clearEmptyCart: true });
    expect(useMutation).toHaveBeenCalledWith(UPDATE_CART, expect.any(Object));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('exposes the cart items and total', () => {
    const { result } = setup();
    expect(result.current.items).toEqual(nodes);
    expect(result.current.total).toBe('kr300.00');
    expect(result.current.isInitialLoad).toBe(false);
    expect(result.current.isUpdating).toBe(false);
  });

  it('is in its initial load until the first result arrives', () => {
    // `null`, not `undefined`: undefined would fall back to the default cart.
    const { result } = setup({ data: null, loading: true });
    expect(result.current.isInitialLoad).toBe(true);
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe('0');
  });

  it('is in its initial load during server rendering, even with cached data', () => {
    vi.mocked(useCartQuery).mockReturnValue({
      data: { cart: { total: 'kr300.00', contents: { nodes } } },
      loading: false,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useMutation).mockReturnValue([vi.fn(), { loading: false }] as never);

    const Probe = () => createElement('p', null, `initial:${useCart().isInitialLoad}`);

    expect(renderToString(createElement(Probe))).toContain('initial:true');
  });

  it('keeps showing data (not the initial load) while refetching', () => {
    const { result } = setup({ loading: true });
    expect(result.current.isInitialLoad).toBe(false);
  });

  it('sends every line with the new quantity for the chosen key', () => {
    const { result, updateCart } = setup();

    act(() => result.current.setQuantity('b', 5));

    expect(updateCart).toHaveBeenCalledWith({
      variables: {
        input: {
          clientMutationId: expect.any(String),
          items: [
            { key: 'a', quantity: 1 },
            { key: 'b', quantity: 5 },
          ],
        },
      },
    });
  });

  it('allows removing a line with quantity 0', () => {
    const { result, updateCart } = setup();
    act(() => result.current.setQuantity('a', 0));
    expect(updateCart.mock.calls[0][0].variables.input.items[0]).toEqual({
      key: 'a',
      quantity: 0,
    });
  });

  it.each([
    ['an update is already running', { isUpdating: true }, 'a', 2],
    ['the cart is empty', { data: { cart: { contents: { nodes: [] } } } }, 'a', 2],
    ['the quantity is negative', {}, 'a', -1],
  ])('ignores changes while %s', (_reason, options, key, quantity) => {
    const { result, updateCart } = setup(options);
    act(() => result.current.setQuantity(key, quantity));
    expect(updateCart).not.toHaveBeenCalled();
  });

  it('refetches right after an update and again once the backend settles', () => {
    vi.useFakeTimers();
    const { refetch } = setup();
    refetch.mockClear();

    act(() => mutationOptions().onCompleted());
    expect(refetch).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(2000));
    expect(refetch).toHaveBeenCalledTimes(2);
  });
});
