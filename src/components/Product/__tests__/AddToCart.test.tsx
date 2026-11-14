import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation } from '@apollo/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AddToCart from '@/components/Product/AddToCart.component';
import { useCartQuery } from '@/hooks/useCartQuery';
import { useCartStore } from '@/stores/cartStore';
import type { ISingleProduct } from '@/types/product';
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

vi.mock('@/hooks/useCartQuery', () => ({ useCartQuery: vi.fn() }));
vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
}));

const product = { databaseId: 13, name: 'Test Simple' } as ISingleProduct;

type MutationOptions = {
  variables: { input: Record<string, unknown> };
  refetchQueries: unknown[];
  onCompleted: () => void;
  onError: () => void;
};

const setup = ({ variationId, loading = false }: { variationId?: number; loading?: boolean } = {}) => {
  const addToCart = vi.fn();
  const refetch = vi.fn();
  vi.mocked(useCartQuery).mockReturnValue({ refetch } as never);
  vi.mocked(useMutation).mockReturnValue([addToCart, { loading }] as never);
  render(<AddToCart product={product} variationId={variationId} />);
  return { addToCart, refetch };
};

const lastOptions = () =>
  vi.mocked(useMutation).mock.lastCall?.[1] as unknown as MutationOptions;

describe('AddToCart', () => {
  beforeEach(() => {
    useCartStore.setState({ isLoading: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a simple product to the cart', async () => {
    const { addToCart } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'KJØP' }));

    expect(addToCart).toHaveBeenCalledOnce();
    expect(useMutation).toHaveBeenCalledWith(ADD_TO_CART, expect.any(Object));
    expect(lastOptions().variables.input).toEqual({
      clientMutationId: expect.any(String),
      productId: 13,
    });
    expect(lastOptions().refetchQueries).toEqual([{ query: GET_CART }]);
  });

  it('includes the selected variation', () => {
    setup({ variationId: 42 });
    expect(lastOptions().variables.input).toMatchObject({ productId: 13, variationId: 42 });
  });

  it('is disabled while the mutation is running', () => {
    setup({ loading: true });
    expect(screen.getByRole('button', { name: 'KJØP' })).toBeDisabled();
  });

  it('shows a loading label while the cart store is loading', () => {
    useCartStore.setState({ isLoading: true });
    setup();
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
  });

  it('disables the button after a failed request', () => {
    setup();
    act(() => lastOptions().onError());
    expect(screen.getByRole('button', { name: 'KJØP' })).toBeDisabled();
  });

  it('refetches the cart once the backend has settled', () => {
    vi.useFakeTimers();
    const { refetch } = setup();

    act(() => lastOptions().onCompleted());
    expect(refetch).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(2000));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
