import { test, expect } from '@playwright/test';

/**
 * End-to-end cart flow.
 * Exercises ApolloProvider, the WooCommerce session middleware/afterware,
 * the Zustand cart store and client-side navigation between routes.
 */

const PRODUCT_SLUG = 'test-simple';
const PRODUCT_NAME = 'Test Simple';

test.describe('Cart flow', () => {
  // Mutates a (guest) WooCommerce session, so keep it serial.
  test.describe.configure({ mode: 'serial' });

  test('add to cart updates header count, cart page and checkout', async ({
    page,
  }) => {
    await page.goto(`/produkt/${PRODUCT_SLUG}`);

    const buyButton = page.getByRole('button', { name: 'KJØP' });
    await expect(buyButton).toBeEnabled();
    await buyButton.click();

    // Header cart badge shows one product
    const cartBadge = page
      .locator('a[href="/handlekurv"] span span')
      .filter({ visible: true })
      .first();
    await expect(cartBadge).toHaveText('1');

    // Client-side navigation to the cart page via the header link
    await page
      .getByRole('link', { name: 'Handlekurv' })
      .filter({ visible: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/handlekurv$/);
    await expect(
      page.getByRole('heading', { name: PRODUCT_NAME, exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel(`Antall ${PRODUCT_NAME}`)).toHaveValue('1');

    // Proceed to checkout
    await page.getByRole('button', { name: 'GÅ TIL KASSE' }).click();
    await expect(page).toHaveURL(/\/kasse$/);
    await expect(
      page.getByRole('heading', { name: PRODUCT_NAME, exact: true }),
    ).toBeVisible();
    // Checkout page hides the "go to checkout" button (pathname check)
    await expect(
      page.getByRole('button', { name: 'GÅ TIL KASSE' }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'BESTILL' })).toBeVisible();
  });
});
