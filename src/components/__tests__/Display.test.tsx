import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SearchResults from '@/components/AlgoliaSearch/SearchResults.component';
import CartInitializer from '@/components/Cart/CartInitializer.component';
import Categories from '@/components/Category/Categories.component';
import Cart from '@/components/Header/Cart.component';
import DisplayProducts from '@/components/Product/DisplayProducts.component';
import ProductCard from '@/components/Product/ProductCard.component';
import { useCartQuery } from '@/hooks/useCartQuery';
import { useCartStore } from '@/stores/cartStore';
import type { IDisplayProduct } from '@/types/product';

vi.mock('@/hooks/useCartQuery', () => ({ useCartQuery: vi.fn() }));

describe('Header Cart', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: null });
  });

  it('links to the cart without a badge when the cart is empty', () => {
    render(<Cart />);
    expect(screen.getByRole('link', { name: 'Handlekurv' })).toHaveAttribute('href', '/handlekurv');
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it('shows the number of products in the cart', () => {
    useCartStore.setState({
      cart: { products: [], totalProductsCount: 3, totalProductsPrice: 0 },
    });
    render(<Cart />);
    expect(screen.getByText('3')).toHaveClass('bg-primary');
  });

  it('uses inverted colours in the sticky mobile nav', () => {
    useCartStore.setState({
      cart: { products: [], totalProductsCount: 1, totalProductsPrice: 0 },
    });
    render(<Cart stickyNav />);
    expect(screen.getByText('1')).toHaveClass('bg-white');
  });
});

describe('CartInitializer', () => {
  it('fetches the cart once and renders nothing', () => {
    const refetch = vi.fn();
    vi.mocked(useCartQuery).mockReturnValue({ refetch } as never);

    const { container } = render(<CartInitializer />);

    expect(refetch).toHaveBeenCalledOnce();
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Categories', () => {
  it('links to every category by its encoded slug', () => {
    render(
      <Categories
        categories={[
          { id: '1', name: 'Clothing', slug: 'clothing' },
          { id: '2', name: 'Bad & Seng', slug: 'bad & seng' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Clothing' })).toHaveAttribute('href', '/kategori/clothing');
    expect(screen.getByRole('link', { name: 'Bad & Seng' })).toHaveAttribute(
      'href',
      '/kategori/bad%20%26%20seng',
    );
  });
});

describe('SearchResults', () => {
  const hit = {
    product_image: '/hit.jpg',
    product_name: 'Test Simple',
    regular_price: '699',
    sale_price: '499',
    on_sale: false,
    short_description: 'A very long product description text',
    slug: 'test-simple',
  };

  it('shows a regular-price hit with a trimmed description', () => {
    render(<SearchResults hit={hit} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/produkt/Test-Simple');
    expect(screen.getByRole('img', { name: 'Test Simple' })).toHaveAttribute('src', '/hit.jpg');
    expect(screen.getByText('kr 699,00')).toBeInTheDocument();
    expect(screen.getByText('A very long product descriptio...')).toBeInTheDocument();
  });

  it('shows sale and regular prices for a hit on sale', () => {
    render(<SearchResults hit={{ ...hit, on_sale: true }} />);
    expect(screen.getByText('kr 499,00')).toHaveClass('text-error');
    expect(screen.getByText('kr 699,00')).toHaveClass('line-through');
  });
});

describe('ProductCard', () => {
  const props = {
    databaseId: 2,
    name: 'Test Simple',
    price: 'kr699.00',
    regularPrice: 'kr699.00',
    onSale: false,
    slug: 'test-simple',
    image: { sourceUrl: '/card.jpg' },
  };

  it('links the image and name to the product page', () => {
    render(<ProductCard {...props} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute('href', '/produkt/test-simple');
    expect(screen.getByRole('img', { name: 'Test Simple' })).toHaveAttribute('src', '/card.jpg');
    expect(screen.getByText('kr 699,00')).toBeInTheDocument();
  });

  it('shows a placeholder without an image', () => {
    render(<ProductCard {...props} image={undefined} />);
    expect(screen.getByText('No image')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows the sale price next to the struck-through regular price', () => {
    render(<ProductCard {...props} onSale salePrice="kr499.00" />);
    expect(screen.getByText('kr 499,00')).toHaveClass('text-error');
    expect(screen.getByText('kr 699,00')).toHaveClass('line-through');
  });
});

describe('DisplayProducts', () => {
  const product = (overrides: Partial<IDisplayProduct>): IDisplayProduct =>
    ({
      name: 'Product',
      slug: 'product',
      onSale: false,
      price: 'kr100.00',
      regularPrice: 'kr100.00',
      image: { sourceUrl: '/p.jpg' },
      variations: undefined,
      ...overrides,
    }) as IDisplayProduct;

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL', '/placeholder.jpg');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows a message when there are no products', () => {
    render(<DisplayProducts products={undefined as unknown as IDisplayProduct[]} />);
    expect(screen.getByText('Ingen produkter funnet')).toBeInTheDocument();
  });

  it('renders each product with image, encoded link and price', () => {
    render(
      <DisplayProducts
        products={[
          product({ name: 'Shirt', slug: 'blå skjorte' }),
          product({ name: 'No image', slug: 'no-image', image: undefined as never }),
          product({ name: 'Empty url', slug: 'empty-url', image: { __typename: 'MediaItem' } }),
        ]}
      />,
    );

    expect(screen.getAllByRole('link', { name: 'Shirt' })[0]).toHaveAttribute(
      'href',
      '/produkt/bl%C3%A5%20skjorte',
    );
    expect(screen.getByRole('img', { name: 'Shirt' })).toHaveAttribute('src', '/p.jpg');
    expect(screen.getByRole('img', { name: 'No image' })).toHaveAttribute('src', '/placeholder.jpg');
    expect(screen.getByRole('img', { name: 'Empty url' })).toHaveAttribute('src', '/placeholder.jpg');
    expect(screen.getAllByText('kr 100,00')).toHaveLength(3);
  });

  it('shows sale and regular price for a simple product on sale', () => {
    render(
      <DisplayProducts
        products={[product({ onSale: true, salePrice: 'kr80.00', regularPrice: 'kr100.00' })]}
      />,
    );
    expect(screen.getByText('kr 80,00')).toHaveClass('text-error');
    expect(screen.getByText('kr 100,00')).toHaveClass('line-through');
  });

  it('splits the price range of a variable product on sale', () => {
    render(
      <DisplayProducts
        products={[
          product({
            onSale: true,
            price: 'kr198.00 - kr299.00',
            variations: { __typename: 'Variations', nodes: [] },
          }),
        ]}
      />,
    );
    expect(screen.getByText('kr 198,00')).toHaveClass('text-error');
    expect(screen.getByText('kr 299,00')).toHaveClass('line-through');
  });
});
