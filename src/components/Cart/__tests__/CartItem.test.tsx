import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import CartItem from '@/components/Cart/CartItem.component';
import type { IProductRootObject } from '@/utils/functions/functions';

const NAME = 'Test Simple';

const makeItem = (
  quantity = 2,
  { sourceUrl = '/img.jpg' }: { sourceUrl?: string | null } = {},
): IProductRootObject =>
  ({
    key: 'key-13',
    quantity,
    subtotal: `kr${(699 * quantity).toFixed(2)}`,
    total: `kr${(699 * quantity).toFixed(2)}`,
    product: {
      node: {
        name: NAME,
        image: sourceUrl ? { sourceUrl } : null,
      },
    },
  }) as unknown as IProductRootObject;

const renderItem = (
  item = makeItem(),
  { disabled = false }: { disabled?: boolean } = {},
) => {
  const onQuantityChange = vi.fn();
  render(
    <ul>
      <CartItem item={item} disabled={disabled} onQuantityChange={onQuantityChange} />
    </ul>,
  );
  return { onQuantityChange, user: userEvent.setup() };
};

describe('CartItem', () => {
  it('renders the name, unit price, line total and quantity', () => {
    renderItem();

    expect(screen.getByRole('heading', { level: 2, name: NAME })).toBeInTheDocument();
    expect(screen.getByText('kr 699,00 per stk')).toBeInTheDocument();
    expect(screen.getByText('kr 1 398,00')).toBeInTheDocument();
    expect(screen.getByLabelText(`Antall ${NAME}`)).toHaveValue(2);
  });

  it('renders the product image when available', () => {
    renderItem();
    expect(screen.getByRole('img', { name: NAME })).toHaveAttribute('src', '/img.jpg');
  });

  it('renders an accessible icon when the product has no image', () => {
    renderItem(makeItem(1, { sourceUrl: null }));
    expect(screen.getByRole('img', { name: `Ingen bilde av ${NAME}` })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: NAME })).not.toBeInTheDocument();
  });

  it('increases and decreases the quantity by one', async () => {
    const { onQuantityChange, user } = renderItem();

    await user.click(screen.getByRole('button', { name: `Øk antall ${NAME}` }));
    expect(onQuantityChange).toHaveBeenLastCalledWith(3);

    await user.click(screen.getByRole('button', { name: `Reduser antall ${NAME}` }));
    expect(onQuantityChange).toHaveBeenLastCalledWith(1);
  });

  it('disables the decrease button at quantity 1', () => {
    renderItem(makeItem(1));
    expect(screen.getByRole('button', { name: `Reduser antall ${NAME}` })).toBeDisabled();
    expect(screen.getByRole('button', { name: `Øk antall ${NAME}` })).toBeEnabled();
  });

  it('sets a typed quantity', () => {
    const { onQuantityChange } = renderItem();
    fireEvent.change(screen.getByLabelText(`Antall ${NAME}`), { target: { value: '7' } });
    expect(onQuantityChange).toHaveBeenCalledWith(7);
  });

  it.each([[''], ['0'], ['-3']])(
    'falls back to quantity 1 for the input value %j',
    (value) => {
      const { onQuantityChange } = renderItem(makeItem(5));
      fireEvent.change(screen.getByLabelText(`Antall ${NAME}`), { target: { value } });
      expect(onQuantityChange).toHaveBeenCalledWith(1);
    },
  );

  it('removes the line by setting the quantity to 0', async () => {
    const { onQuantityChange, user } = renderItem();
    await user.click(screen.getByRole('button', { name: `Fjern ${NAME} fra handlekurven` }));
    expect(onQuantityChange).toHaveBeenCalledWith(0);
  });

  it('disables all controls while the cart is updating', () => {
    renderItem(makeItem(3), { disabled: true });
    for (const name of [
      `Reduser antall ${NAME}`,
      `Øk antall ${NAME}`,
      `Fjern ${NAME} fra handlekurven`,
    ]) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });
});
