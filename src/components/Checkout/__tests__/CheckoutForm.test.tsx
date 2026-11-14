import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useMutation } from '@apollo/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CheckoutForm from '@/components/Checkout/CheckoutForm.component';
import { useCartQuery } from '@/hooks/useCartQuery';
import { useCartStore } from '@/stores/cartStore';
import { CHECKOUT_MUTATION } from '@/utils/gql/GQL_MUTATIONS';

vi.mock('@/hooks/useCartQuery', () => ({ useCartQuery: vi.fn() }));
vi.mock('@/components/Cart/CartContents.component', () => ({
  default: () => <div>Handlekurvinnhold</div>,
}));
vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
}));

const CART = { products: [], totalProductsCount: 1, totalProductsPrice: 699 };

const FIELDS: Record<string, string> = {
  Fornavn: 'Kari',
  Etternavn: 'Nordmann',
  Adresse: 'Karl Johans gate 1',
  Postnummer: '0154',
  Sted: 'Oslo',
  Epost: 'kari@example.com',
  Telefon: '12345678',
};

type CheckoutOptions = { onCompleted: () => void; onError: (error: Error) => void };

const setup = ({ cart = CART as typeof CART | null, loading = false } = {}) => {
  useCartStore.setState({ cart });
  const checkout = vi.fn();
  const refetch = vi.fn();
  vi.mocked(useCartQuery).mockReturnValue({ refetch } as never);
  vi.mocked(useMutation).mockReturnValue([checkout, { loading }] as never);
  render(<CheckoutForm />);
  return { checkout, refetch };
};

const options = () => vi.mocked(useMutation).mock.lastCall?.[1] as unknown as CheckoutOptions;

describe('CheckoutForm', () => {
  beforeEach(() => {
    vi.mocked(useMutation).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows an empty-cart message when there is no cart', () => {
    const { refetch } = setup({ cart: null });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ingen produkter i handlekurven' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'BESTILL' })).not.toBeInTheDocument();
    expect(useCartQuery).toHaveBeenCalledWith({ clearEmptyCart: true });
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('shows the cart and the billing form when the cart has items', () => {
    setup();
    expect(useMutation).toHaveBeenCalledWith(CHECKOUT_MUTATION, expect.any(Object));
    expect(screen.getByText('Handlekurvinnhold')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BESTILL' })).toBeInTheDocument();
  });

  it('places the order with billing copied to shipping and refetches afterwards', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { checkout, refetch } = setup();
    refetch.mockClear();

    for (const [label, value] of Object.entries(FIELDS)) {
      fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), {
        target: { value },
      });
    }
    fireEvent.click(screen.getByRole('button', { name: 'BESTILL' }));

    await waitFor(() => expect(checkout).toHaveBeenCalledOnce());
    const { input } = checkout.mock.calls[0][0].variables;
    expect(input).toMatchObject({
      paymentMethod: 'cod',
      isPaid: false,
      shipToDifferentAddress: false,
      billing: { firstName: 'Kari', city: 'Oslo', postcode: '0154' },
    });
    expect(input.shipping).toEqual(input.billing);

    act(() => vi.advanceTimersByTime(2000));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('does not place an order when the form is invalid', async () => {
    const { checkout } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'BESTILL' }));
    expect(await screen.findByText('Fornavn er påkrevd')).toBeInTheDocument();
    expect(checkout).not.toHaveBeenCalled();
  });

  it('shows a progress message while the order is processing', () => {
    setup({ loading: true });
    expect(screen.getByText(/Behandler ordre, vennligst vent/)).toBeInTheDocument();
  });

  it('thanks the customer and clears the session after a successful order', () => {
    const { refetch } = setup();
    localStorage.setItem('woo-session:v1', '{"token":"abc"}');
    refetch.mockClear();

    act(() => options().onCompleted());

    expect(screen.getByText('Takk for din ordre!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'BESTILL' })).not.toBeInTheDocument();
    expect(useCartStore.getState().cart).toBeNull();
    expect(localStorage.getItem('woo-session:v1')).toBeNull();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('shows an error and keeps the form when the order fails', () => {
    const { refetch } = setup();
    refetch.mockClear();

    act(() => options().onError(new Error('Payment failed')));

    expect(screen.getByRole('alert')).toHaveTextContent('En feil har oppstått.');
    expect(screen.getByRole('button', { name: 'BESTILL' })).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledOnce();
  });
});
