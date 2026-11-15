/**
 * Shared test data for the Playwright E2E specs.
 *
 * These values must exist in the WooCommerce backend, because server-side
 * rendering is not mocked. If the backend data changes, update it here only.
 */

/** Simple product used for the product page, cart and checkout flows. */
export const TEST_PRODUCT = {
  databaseId: 13,
  name: 'Test Simple',
  slug: 'test-simple',
  price: '699',
} as const;

/** Category that currently contains TEST_PRODUCT. */
export const TEST_CATEGORY = {
  name: 'Tskjorter',
  slug: 'tskjorter',
} as const;

/** Second category, used to check navigation between categories. */
export const SECONDARY_CATEGORY = {
  name: 'Clothing',
  slug: 'clothing',
} as const;

export const productPath = (slug: string = TEST_PRODUCT.slug) => `/produkt/${slug}`;
export const categoryPath = (slug: string = TEST_CATEGORY.slug) => `/kategori/${slug}`;
