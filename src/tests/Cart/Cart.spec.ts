import { test, expect } from '@playwright/test';
import { mockWooGraphql, MOCK_SESSION_TOKEN } from '@/tests/helpers/mockWooGraphql';

/**
 * End-to-end cart flow.
 * Exercises ApolloProvider, the WooCommerce session middleware/afterware,
 * the Zustand cart store, the header cart badge, client-side navigation and
 * the /kasse pathname check.
 *
 * Browser-side GraphQL is mocked (see helpers/mockWooGraphql.ts) so the test
 * does not depend on the backend's CORS configuration; SSR data is still real.
 */

const PRODUCT = {
  databaseId: 13,
  name: 'Test Simple',
  slug: 'test-simple',
  price: '699',
};

test.describe('Cart flow', () => {
  test('add to cart updates header count, cart page and checkout', async ({
    page,
  }) => {
    const mock = await mockWooGraphql(page, PRODUCT);

    await page.goto(`/produkt/${PRODUCT.slug}`);

    const buyButton = page.getByRole('button', { name: 'KJØP' });
    await expect(buyButton).toBeEnabled();
    await buyButton.click();

    // Header cart badge shows one product
    const cartBadge = page
      .locator('a[href="/handlekurv"] span span')
      .filter({ visible: true })
      .first();
    await expect(cartBadge).toHaveText('1');
    expect(mock.requests).toContain('addToCart');

    // Afterware stored the WooCommerce session token
    const session = await page.evaluate(() =>
      localStorage.getItem('woo-session:v1'),
    );
    expect(JSON.parse(session ?? '{}').token).toBe(MOCK_SESSION_TOKEN);

    // Client-side navigation to the cart page via the header link
    await page
      .getByRole('link', { name: 'Handlekurv' })
      .filter({ visible: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/handlekurv$/);
    // Wait for the new page to render before asserting on its content
    await expect(
      page.getByRole('heading', { name: 'Handlekurv', exact: true, level: 1 }),
    ).toBeVisible();
    // Cart rows render the product name as <h2>
    const cartRow = page.getByRole('heading', {
      name: PRODUCT.name,
      exact: true,
      level: 2,
    });
    await expect(cartRow).toBeVisible();
    await expect(page.getByLabel(`Antall ${PRODUCT.name}`)).toHaveValue('1');

    // Proceed to checkout
    await page.getByRole('button', { name: 'GÅ TIL KASSE' }).click();
    await expect(page).toHaveURL(/\/kasse$/);
    await expect(
      page.getByRole('heading', { name: 'Kasse', exact: true, level: 1 }),
    ).toBeVisible();
    await expect(cartRow).toBeVisible();
    // Checkout page hides the "go to checkout" button (pathname check)
    await expect(
      page.getByRole('button', { name: 'GÅ TIL KASSE' }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'BESTILL' })).toBeVisible();
  });
});
