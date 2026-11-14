import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ProductList from '@/components/Product/ProductList.component';
import type { Product } from '@/types/product';

const product = (
  databaseId: number,
  name: string,
  price: string,
  extra: Partial<Product> = {},
): Product => ({
  __typename: 'SimpleProduct',
  databaseId,
  name,
  onSale: false,
  slug: name.toLowerCase().replace(/\s/g, '-'),
  image: { __typename: 'MediaItem', sourceUrl: '/img.jpg' },
  price,
  regularPrice: price,
  variations: { nodes: [] },
  ...extra,
});

const PRODUCTS = [
  product(1, 'Blue Shirt', '300', {
    productCategories: { nodes: [{ name: 'Tskjorter', slug: 'tskjorter' }] },
    allPaSizes: { nodes: [{ name: 'M' }] },
    allPaColors: { nodes: [{ name: 'Blå', slug: 'blue' }] },
  }),
  product(2, 'Red Hoodie', '900', {
    productCategories: { nodes: [{ name: 'Clothing', slug: 'clothing' }] },
    allPaSizes: { nodes: [{ name: 'L' }] },
    allPaColors: { nodes: [{ name: 'Rød', slug: 'red' }] },
  }),
  product(3, 'Cap', '100', {
    productCategories: { nodes: [{ name: 'Clothing', slug: 'clothing' }] },
  }),
];

const renderList = () => {
  render(<ProductList products={PRODUCTS} title="Herreklær" />);
  return userEvent.setup();
};

const heading = () => screen.getByRole('heading', { level: 1 });
const productNames = () =>
  screen
    .getAllByRole('link')
    .map((link) => link.getAttribute('href'))
    .filter((href, index, all) => href?.startsWith('/produkt/') && all.indexOf(href) === index);

describe('ProductList', () => {
  it('shows the title with the number of products', () => {
    renderList();
    expect(heading()).toHaveTextContent('Herreklær (3)');
  });

  it('derives filter options from the products', () => {
    renderList();
    expect(screen.getByRole('checkbox', { name: 'Clothing' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Tskjorter' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'M' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'L' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filtrer etter farge: Blå' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filtrer etter farge: Rød' })).toBeInTheDocument();
  });

  it('sorts products by price and newest', async () => {
    const user = renderList();
    const select = screen.getByLabelText('Sortering:');

    await user.selectOptions(select, 'price-low');
    expect(productNames()).toEqual(['/produkt/cap', '/produkt/blue-shirt', '/produkt/red-hoodie']);

    await user.selectOptions(select, 'price-high');
    expect(productNames()).toEqual(['/produkt/red-hoodie', '/produkt/blue-shirt', '/produkt/cap']);

    await user.selectOptions(select, 'newest');
    expect(productNames()).toEqual(['/produkt/cap', '/produkt/red-hoodie', '/produkt/blue-shirt']);
  });

  it('filters by product type', async () => {
    const user = renderList();
    await user.click(screen.getByRole('checkbox', { name: 'Tskjorter' }));
    expect(heading()).toHaveTextContent('(1)');
    expect(productNames()).toEqual(['/produkt/blue-shirt']);
  });

  it('filters by size and color', async () => {
    const user = renderList();

    await user.click(screen.getByRole('button', { name: 'L' }));
    expect(productNames()).toEqual(['/produkt/red-hoodie']);

    await user.click(screen.getByRole('button', { name: 'L' }));
    await user.click(screen.getByRole('button', { name: 'Filtrer etter farge: Blå' }));
    expect(productNames()).toEqual(['/produkt/blue-shirt']);
  });

  it('filters by maximum price', () => {
    renderList();
    fireEvent.change(screen.getByRole('slider', { name: 'Pris' }), {
      target: { value: '500' },
    });
    expect(heading()).toHaveTextContent('(2)');
    expect(productNames()).not.toContain('/produkt/red-hoodie');
  });

  it('resets every filter', async () => {
    const user = renderList();
    await user.click(screen.getByRole('checkbox', { name: 'Clothing' }));
    await user.click(screen.getByRole('button', { name: 'L' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Pris' }), {
      target: { value: '50' },
    });
    expect(heading()).toHaveTextContent('(0)');

    await user.click(screen.getByRole('button', { name: 'Resett filter' }));

    expect(heading()).toHaveTextContent('(3)');
    expect(screen.getByRole('checkbox', { name: 'Clothing' })).not.toBeChecked();
    expect(screen.getByRole('slider', { name: 'Pris' })).toHaveValue('1000');
  });

  it('lists a shared colour once and turns it off when clicked again', async () => {
    const user = userEvent.setup();
    const blue = { allPaColors: { nodes: [{ name: 'Blå', slug: 'blue' }] } };
    render(
      <ProductList
        products={[
          product(1, 'Shirt', '100', blue),
          product(2, 'Hoodie', '200', blue),
          product(3, 'Cap', '300'),
        ]}
        title="Klær"
      />,
    );

    const colourButtons = screen.getAllByRole('button', {
      name: 'Filtrer etter farge: Blå',
    });
    expect(colourButtons).toHaveLength(1);

    await user.click(colourButtons[0]);
    expect(heading()).toHaveTextContent('(2)');
    expect(colourButtons[0]).toHaveClass('ring-2');

    await user.click(colourButtons[0]);
    expect(heading()).toHaveTextContent('(3)');
    expect(colourButtons[0]).not.toHaveClass('ring-2');
  });

  it('hides size and color filters when no product has them', () => {
    render(<ProductList products={[PRODUCTS[2]]} title="Caps" />);
    expect(screen.queryByText('STØRRELSE')).not.toBeInTheDocument();
    expect(screen.queryByText('FARGE')).not.toBeInTheDocument();
    expect(within(heading()).getByText('(1)')).toBeInTheDocument();
  });
});
