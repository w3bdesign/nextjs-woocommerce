import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CartContents from '@/components/Cart/CartContents.component';
import CartSummary from '@/components/Cart/CartSummary.component';
import { useCart } from '@/hooks/useCart';
import type { IProductRootObject } from '@/utils/functions/functions';

vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));

const item = (key: string, name: string, quantity = 1) =>
  ({
    key,
    quantity,
    subtotal: `kr${(100 * quantity).toFixed(2)}`,
    total: `kr${(100 * quantity).toFixed(2)}`,
    product: { node: { name, image: null } },
  }) as unknown as IProductRootObject;

const mockCart = (overrides: Partial<ReturnType<typeof useCart>> = {}) => {
  const value = {
    items: [],
    total: '0',
    isInitialLoad: false,
    isUpdating: false,
    setQuantity: vi.fn(),
    ...overrides,
  };
  vi.mocked(useCart).mockReturnValue(value);
  return value;
};

describe('CartContents', () => {
  beforeEach(() => {
    vi.mocked(useCart).mockReset();
  });

  it('shows the skeleton, never the empty message, during the initial load', () => {
    mockCart({ isInitialLoad: true });
    render(<CartContents />);

    expect(screen.getByText('Laster handlekurv…')).toBeInTheDocument();
    expect(screen.queryByText('Ingen produkter i handlekurven')).not.toBeInTheDocument();
  });

  it('shows the empty state with a link back to the products', () => {
    mockCart();
    render(<CartContents />);

    expect(
      screen.getByRole('heading', { name: 'Ingen produkter i handlekurven' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/produkter');
  });

  it('lists every cart item with the subtotal and checkout link', () => {
    mockCart({
      items: [item('a', 'Shirt'), item('b', 'Hoodie', 2)],
      total: 'kr300.00',
    });
    render(<CartContents />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Shirt' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hoodie' })).toBeInTheDocument();
    expect(screen.getByText('kr 300,00')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GÅ TIL KASSE' })).toHaveAttribute(
      'href',
      '/kasse',
    );
  });

  it('hides the checkout link on the checkout page', () => {
    vi.mocked(usePathname).mockReturnValue('/kasse');
    mockCart({ items: [item('a', 'Shirt')], total: 'kr100.00' });
    render(<CartContents />);

    expect(screen.queryByRole('button', { name: 'GÅ TIL KASSE' })).not.toBeInTheDocument();
  });

  it('passes quantity changes for the right cart key to setQuantity', async () => {
    const { setQuantity } = mockCart({
      items: [item('a', 'Shirt'), item('b', 'Hoodie', 2)],
    });
    render(<CartContents />);

    await userEvent.click(screen.getByRole('button', { name: 'Øk antall Hoodie' }));
    expect(setQuantity).toHaveBeenCalledWith('b', 3);

    await userEvent.click(
      screen.getByRole('button', { name: 'Fjern Shirt fra handlekurven' }),
    );
    expect(setQuantity).toHaveBeenCalledWith('a', 0);
  });

  it('shows the updating overlay and disables controls while updating', () => {
    mockCart({ items: [item('a', 'Shirt', 2)], isUpdating: true });
    render(<CartContents />);

    expect(screen.getByText('Oppdaterer handlekurv…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Øk antall Shirt' })).toBeDisabled();
  });
});

describe('CartSummary', () => {
  it('formats the total and links to checkout', () => {
    render(<CartSummary total="kr1 398,00" showCheckoutLink />);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('kr 1 398,00')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GÅ TIL KASSE' })).toBeInTheDocument();
  });

  it('can hide the checkout link', () => {
    render(<CartSummary total="0" showCheckoutLink={false} />);
    expect(screen.getByText('kr 0,00')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
