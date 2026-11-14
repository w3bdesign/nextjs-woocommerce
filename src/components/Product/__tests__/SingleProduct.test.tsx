import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AddToCart from '@/components/Product/AddToCart.component';
import SingleProduct from '@/components/Product/SingleProduct.component';
import type { ISingleProduct } from '@/types/product';

vi.mock('@/components/Product/AddToCart.component', () => ({
  default: vi.fn(() => <button type="button">KJØP</button>),
}));

const makeProduct = (overrides: Partial<ISingleProduct> = {}): ISingleProduct =>
  ({
    databaseId: 13,
    name: 'Test Simple',
    description: '<p>Myk <strong>bomull</strong></p>',
    onSale: false,
    price: 'kr699.00',
    regularPrice: 'kr699.00',
    salePrice: undefined,
    stockQuantity: 5,
    image: { sourceUrl: '/shirt.jpg' },
    ...overrides,
  }) as ISingleProduct;

const VARIATIONS = {
  __typename: 'ProductToProductVariationConnection',
  nodes: [
    { id: 'v1', databaseId: 101, name: 'Shirt - S', stockQuantity: 3 },
    { id: 'v2', databaseId: 102, name: 'Shirt - M', stockQuantity: 7 },
  ],
} as ISingleProduct['variations'];

const lastAddToCartProps = () => vi.mocked(AddToCart).mock.lastCall?.[0];

describe('SingleProduct', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows the name, formatted price, plain-text description and image', () => {
    render(<SingleProduct product={makeProduct()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Test Simple' })).toBeInTheDocument();
    expect(screen.getByText('kr 699,00')).toBeInTheDocument();
    expect(screen.getByText('Myk bomull')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Test Simple' })).toHaveAttribute('src', '/shirt.jpg');
  });

  it('leaves the description out of the server HTML so hydration matches', () => {
    const html = renderToString(<SingleProduct product={makeProduct()} />);
    expect(html).toContain('Test Simple');
    expect(html).not.toContain('Myk');
  });

  it('falls back to the placeholder image', () => {
    vi.stubEnv('NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL', '');
    render(<SingleProduct product={makeProduct({ image: null as never })} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://via.placeholder.com/600');
  });

  it('shows stock status only when quantity is known', () => {
    const { rerender } = render(<SingleProduct product={makeProduct()} />);
    expect(screen.getByText('5 på lager')).toBeInTheDocument();

    rerender(<SingleProduct product={makeProduct({ stockQuantity: 0 })} />);
    expect(screen.queryByText(/på lager/)).not.toBeInTheDocument();
  });

  it('shows the sale price and the struck-through regular price', () => {
    render(
      <SingleProduct
        product={makeProduct({ onSale: true, salePrice: 'kr499.00', regularPrice: 'kr699.00' })}
      />,
    );
    expect(screen.getByText('kr 499,00')).toHaveClass('text-error');
    expect(screen.getByText('kr 699,00')).toHaveClass('line-through');
  });

  it('splits a variable product price range into sale and original price', () => {
    render(
      <SingleProduct
        product={makeProduct({
          onSale: true,
          price: 'kr198.00 - kr299.00',
          variations: VARIATIONS,
        })}
      />,
    );
    expect(screen.getByText('kr 198,00')).toHaveClass('text-error');
    expect(screen.getByText('kr 299,00')).toHaveClass('line-through');
  });

  it('adds a simple product without a variation id', () => {
    render(<SingleProduct product={makeProduct()} />);
    expect(screen.queryByLabelText('Varianter')).not.toBeInTheDocument();
    expect(lastAddToCartProps()).toMatchObject({ variationId: undefined, fullWidth: true });
  });

  it('lets the customer pick a variation and passes it to AddToCart', async () => {
    render(<SingleProduct product={makeProduct({ variations: VARIATIONS })} />);

    const select = screen.getByLabelText('Varianter');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'S - (3 på lager)',
      'M - (7 på lager)',
    ]);
    expect(lastAddToCartProps()?.variationId).toBe(101);

    await userEvent.selectOptions(select, '102');
    expect(lastAddToCartProps()?.variationId).toBe(102);
  });

  it('resets the selected variation when the product changes', async () => {
    const { rerender } = render(<SingleProduct product={makeProduct({ variations: VARIATIONS })} />);
    await userEvent.selectOptions(screen.getByLabelText('Varianter'), '102');

    const otherVariations = {
      ...VARIATIONS,
      nodes: [{ id: 'v9', databaseId: 201, name: 'Hoodie - L', stockQuantity: 1 }],
    } as ISingleProduct['variations'];
    rerender(
      <SingleProduct product={makeProduct({ databaseId: 14, variations: otherVariations })} />,
    );

    expect(lastAddToCartProps()?.variationId).toBe(201);
  });
});
