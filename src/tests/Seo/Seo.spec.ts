import { test, expect, type Page } from '@playwright/test';

/**
 * SEO / document head regression tests.
 * Values captured from the Pages Router build before the App Router migration.
 */

const TITLE_PREFIX = 'Next.js webshop with WooCommerce';

const ROUTES: { path: string; title: string }[] = [
  { path: '/', title: `${TITLE_PREFIX} Hjem` },
  { path: '/produkter', title: 'Produkter | WooCommerce Next.js' },
  { path: '/kategorier', title: `${TITLE_PREFIX} Kategorier` },
  { path: '/handlekurv', title: `${TITLE_PREFIX} Handlekurv` },
  { path: '/kasse', title: `${TITLE_PREFIX} Kasse` },
  { path: '/logg-inn', title: `${TITLE_PREFIX} Logg inn` },
  { path: '/produkt/test-simple', title: `${TITLE_PREFIX} Test Simple` },
  { path: '/kategori/clothing', title: `${TITLE_PREFIX} Clothing` },
];

const expectSharedHead = async (page: Page) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'nb-NO');
  // Strict locators: also fail if a tag is duplicated.
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'WooCommerce webshop',
  );
  await expect(page.locator('meta[name="keywords"]')).toHaveAttribute(
    'content',
    /Ecommerce,\s*WooCommerce/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Nextjs Ecommerce with Woocommerce',
  );
  await expect(
    page.locator('link[rel="icon"][href^="/favicon.ico"]').first(),
  ).toBeAttached();
};

test.describe('SEO head', () => {
  for (const { path, title } of ROUTES) {
    test(`${path} has expected title and meta`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      await expectSharedHead(page);
    });
  }
});
