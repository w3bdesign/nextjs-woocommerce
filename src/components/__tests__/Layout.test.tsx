import { fireEvent, render, screen, within } from '@testing-library/react';
import { useApolloClient } from '@apollo/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComponentType, FocusEventHandler } from 'react';

import Providers from '@/app/providers';
import AlgoliaSearchBox from '@/components/AlgoliaSearch/AlgoliaSearchBox.component';
import MobileSearch from '@/components/AlgoliaSearch/MobileSearch.component';
import FadeLeftToRight from '@/components/Animations/FadeLeftToRight.component';
import Footer from '@/components/Footer/Footer.component';
import Hero from '@/components/Index/Hero.component';
import Layout from '@/components/Layout/Layout.component';
import SVGMobileSearchIcon from '@/components/SVG/SVGMobileSearchIcon.component';
import client from '@/utils/apollo/ApolloClient';

// Fake Algolia: no network, and tests choose the current search query.
const search = vi.hoisted(() => ({ query: '' }));

vi.mock('algoliasearch/lite', () => ({ liteClient: vi.fn(() => ({})) }));
vi.mock('react-instantsearch', () => ({
  InstantSearch: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSearchBox: () => ({ query: search.query }),
  SearchBox: ({
    placeholder,
    classNames,
    onFocus,
    onBlur,
  }: {
    placeholder: string;
    classNames: { input: string };
    onFocus: FocusEventHandler;
    onBlur: FocusEventHandler;
  }) => (
    <input
      type="search"
      placeholder={placeholder}
      className={classNames.input}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  ),
  Hits: ({ hitComponent: Hit }: { hitComponent: ComponentType<{ hit: object }> }) => (
    <Hit
      hit={{
        product_image: '/hit.jpg',
        product_name: 'Test Simple',
        regular_price: '699',
        sale_price: '',
        on_sale: false,
        short_description: 'Kort',
        slug: 'test-simple',
      }}
    />
  ),
}));

vi.mock('@/components/Cart/CartInitializer.component', () => ({
  default: () => <span>cart-initializer</span>,
}));

afterEach(() => {
  search.query = '';
});

describe('Layout', () => {
  it('shows a page title for normal pages', () => {
    render(
      <Layout title="Produkter">
        <p>Innhold</p>
      </Layout>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Produkter' })).toBeInTheDocument();
    expect(screen.getByText('Innhold')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Innhold');
  });

  it('renders the front page without a page title', () => {
    render(
      <Layout title="Hjem">
        <p>Forside</p>
      </Layout>,
    );
    expect(screen.queryByRole('heading', { name: 'Hjem' })).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Forside');
  });

  it('has navigation links, cart links and a footer', () => {
    render(<Layout title="Kategorier" />);

    const header = screen.getByRole('banner');
    expect(within(header).getAllByRole('link', { name: 'NETTBUTIKK' })[0]).toHaveAttribute('href', '/');
    expect(within(header).getByRole('link', { name: 'Produkter' })).toHaveAttribute('href', '/produkter');
    expect(within(header).getByRole('link', { name: 'Kategorier' })).toHaveAttribute('href', '/kategorier');
    expect(screen.getAllByRole('link', { name: 'Handlekurv' })).toHaveLength(2);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Daniel / w3bdesign');
  });
});

describe('Footer', () => {
  it('shows the current year', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});

describe('Hero', () => {
  it('shows the campaign heading, image and a link to the products', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1, name: 'Stripete Zig Zag Pute Sett' })).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/hero.jpg');
    expect(screen.getByRole('link', { name: 'Se Utvalget' })).toHaveAttribute('href', '/produkter');
  });
});

describe('SVGMobileSearchIcon', () => {
  it('scrolls smoothly to the top', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<SVGMobileSearchIcon />);

    fireEvent.click(screen.getByRole('button', { name: 'Scroll to top' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});

describe.each([
  ['AlgoliaSearchBox', AlgoliaSearchBox],
  ['MobileSearch', MobileSearch],
])('%s', (_name, SearchComponent) => {
  it('highlights the search field while it has focus', () => {
    render(<SearchComponent />);
    const input = screen.getByPlaceholderText('Søk etter produkter');

    expect(input).toHaveClass('border-border');
    fireEvent.focus(input);
    expect(input).toHaveClass('border-primary');
    fireEvent.blur(input);
    expect(input).toHaveClass('border-border');
  });

  it('shows results only when there is a query', () => {
    const { rerender } = render(<SearchComponent />);
    expect(screen.queryByText('Test Simple')).not.toBeInTheDocument();

    search.query = 'test';
    rerender(<SearchComponent />);
    expect(screen.getByText('Test Simple')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/produkt/Test-Simple');
  });
});

describe('FadeLeftToRight', () => {
  it('renders its children with the given class and default stagger', () => {
    render(
      <FadeLeftToRight delay={0} animateNotReverse cssClass="menu">
        <span>Item</span>
      </FadeLeftToRight>,
    );
    expect(screen.getByTestId('fadelefttoright')).toHaveClass('menu');
    expect(screen.getByText('Item')).toBeInTheDocument();
  });
});

describe('Providers', () => {
  it('provides the Apollo client and initialises the cart', () => {
    let provided: unknown;
    const Consumer = () => {
      provided = useApolloClient();
      return <p>child</p>;
    };

    render(
      <Providers>
        <Consumer />
      </Providers>,
    );

    expect(provided).toBe(client);
    expect(screen.getByText('cart-initializer')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
