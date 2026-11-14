import { describe, expect, it } from 'vitest';

import {
  getMaxProductPrice,
  getProductSortComparator,
  getUniqueProductTypes,
  isWithinPriceRange,
  matchesColor,
  matchesProductType,
  matchesSize,
  parseProductPrice,
} from '@/utils/functions/productUtils';
import type { Product, ProductType } from '@/types/product';

const product = (overrides: Partial<Product> = {}): Product => ({
  __typename: 'SimpleProduct',
  databaseId: 1,
  name: 'Product',
  onSale: false,
  slug: 'product',
  image: { __typename: 'MediaItem', sourceUrl: '/img.jpg' },
  price: 'kr100.00',
  regularPrice: 'kr100.00',
  variations: { nodes: [] },
  ...overrides,
});

const type = (name: string, checked: boolean): ProductType => ({
  id: name.toLowerCase(),
  name,
  checked,
});

describe('getUniqueProductTypes', () => {
  it('returns unique categories by slug, sorted by name and unchecked', () => {
    const products = [
      product({
        productCategories: {
          nodes: [
            { name: 'Tskjorter', slug: 'tskjorter' },
            { name: 'Clothing', slug: 'clothing' },
          ],
        },
      }),
      product({
        productCategories: { nodes: [{ name: 'Clothing', slug: 'clothing' }] },
      }),
      product(),
    ];

    expect(getUniqueProductTypes(products)).toEqual([
      { id: 'clothing', name: 'Clothing', checked: false },
      { id: 'tskjorter', name: 'Tskjorter', checked: false },
    ]);
  });

  it('handles an empty or missing product list', () => {
    expect(getUniqueProductTypes([])).toEqual([]);
    expect(getUniqueProductTypes(undefined as unknown as Product[])).toEqual([]);
  });
});

describe('getMaxProductPrice', () => {
  it('never returns less than 1000', () => {
    expect(getMaxProductPrice([product({ price: '199' })])).toBe(1000);
    expect(getMaxProductPrice([])).toBe(1000);
  });

  it('rounds the highest price up', () => {
    expect(
      getMaxProductPrice([
        product({ price: 'kr1 499,50' }),
        product({ price: 'kr200' }),
      ]),
    ).toBe(1500);
  });

  it('ignores unparseable prices', () => {
    expect(getMaxProductPrice([product({ price: 'N/A' })])).toBe(1000);
  });
});

describe('isWithinPriceRange', () => {
  it('includes both range boundaries', () => {
    expect(isWithinPriceRange(product({ price: '100' }), [100, 200])).toBe(true);
    expect(isWithinPriceRange(product({ price: '200' }), [100, 200])).toBe(true);
  });

  it('excludes prices outside the range', () => {
    expect(isWithinPriceRange(product({ price: '99' }), [100, 200])).toBe(false);
    expect(isWithinPriceRange(product({ price: '201' }), [100, 200])).toBe(false);
  });

  it('uses the lowest price for variable-product ranges', () => {
    expect(
      isWithinPriceRange(product({ price: 'kr150.00 - kr500.00' }), [100, 200]),
    ).toBe(true);
  });
});

describe('matchesProductType', () => {
  const shirt = product({
    productCategories: { nodes: [{ name: 'Tskjorter', slug: 'tskjorter' }] },
  });

  it('matches everything when no type is checked', () => {
    expect(matchesProductType(shirt, [type('Clothing', false)])).toBe(true);
    expect(matchesProductType(product(), [])).toBe(true);
  });

  it('matches case-insensitively on category name', () => {
    expect(matchesProductType(shirt, [type('TSKJORTER', true)])).toBe(true);
  });

  it('rejects products outside the checked types', () => {
    expect(matchesProductType(shirt, [type('Clothing', true)])).toBe(false);
    expect(matchesProductType(product(), [type('Clothing', true)])).toBe(false);
  });
});

describe('matchesSize', () => {
  const sized = product({ allPaSizes: { nodes: [{ name: 'M' }, { name: 'L' }] } });

  it('matches everything when no size is selected', () => {
    expect(matchesSize(sized, [])).toBe(true);
  });

  it('matches when any selected size is available', () => {
    expect(matchesSize(sized, ['S', 'L'])).toBe(true);
  });

  it('rejects products without the selected sizes', () => {
    expect(matchesSize(sized, ['XL'])).toBe(false);
    expect(matchesSize(product(), ['M'])).toBe(false);
  });
});

describe('matchesColor', () => {
  const colored = product({
    allPaColors: { nodes: [{ name: 'Blå', slug: 'blue' }] },
  });

  it('matches everything when no color is selected', () => {
    expect(matchesColor(colored, [])).toBe(true);
  });

  it('matches by color name', () => {
    expect(matchesColor(colored, ['Blå'])).toBe(true);
  });

  it('rejects products without the selected colors', () => {
    expect(matchesColor(colored, ['Rød'])).toBe(false);
    expect(matchesColor(product(), ['Blå'])).toBe(false);
  });
});

describe('getProductSortComparator', () => {
  const products = [
    product({ databaseId: 1, price: '300' }),
    product({ databaseId: 3, price: '100' }),
    product({ databaseId: 2, price: '200' }),
  ];
  const ids = (sortBy: string) =>
    products.toSorted(getProductSortComparator(sortBy)).map((p) => p.databaseId);

  it('sorts by price ascending', () => {
    expect(ids('price-low')).toEqual([3, 2, 1]);
  });

  it('sorts by price descending', () => {
    expect(ids('price-high')).toEqual([1, 2, 3]);
  });

  it('sorts newest (highest id) first', () => {
    expect(ids('newest')).toEqual([3, 2, 1]);
  });

  it('keeps the original order for "popular" and unknown options', () => {
    expect(ids('popular')).toEqual([1, 3, 2]);
    expect(ids('unknown')).toEqual([1, 3, 2]);
  });
});

describe('parseProductPrice', () => {
  it('re-exports the shared price parser', () => {
    expect(parseProductPrice('kr&nbsp;699,00')).toBe(699);
  });
});
