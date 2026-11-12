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
    await expect(
      page.getByLabel(`Antall ${PRODUCT.name}`, { exact: true }),
    ).toHaveValue('1');

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

  test('a filled cart shows a loading skeleton, never the empty message, while it loads', async ({
    page,
  }) => {
    await mockWooGraphql(page, PRODUCT, {
      initialQuantity: 2,
      cartDelayMs: 1500,
    });

    const hydrationErrors: string[] = [];
    page.on('pageerror', (error) => {
      if (/hydrat/i.test(error.message)) hydrationErrors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });

    // Record if the empty-cart message is ever rendered, however briefly
    await page.addInitScript(() => {
      const win = window as Window & { __emptyCartShown?: boolean };
      win.__emptyCartShown = false;
      new MutationObserver(() => {
        if (document.body?.textContent?.includes('Ingen produkter i handlekurven')) {
          win.__emptyCartShown = true;
        }
      }).observe(document, { childList: true, subtree: true, characterData: true });
    });

    const response = await page.goto('/handlekurv');

    // The server cannot see the browser cart, so it must not claim the cart is empty
    expect(await response?.text()).not.toContain('Ingen produkter i handlekurven');

    await expect(page.getByText('Laster handlekurv…')).toBeAttached();
    await expect(
      page.getByRole('heading', { name: PRODUCT.name, exact: true, level: 2 }),
    ).toBeVisible();
    await expect(page.getByText('Laster handlekurv…')).toHaveCount(0);

    expect(
      await page.evaluate(
        () => (window as Window & { __emptyCartShown?: boolean }).__emptyCartShown,
      ),
    ).toBe(false);
    expect(hydrationErrors).toEqual([]);
  });

  test('a product without an image shows an icon and requests no fallback file', async ({
    page,
  }) => {
    const productWithoutImage = { ...PRODUCT, hasImage: false };
    await mockWooGraphql(page, productWithoutImage, { initialQuantity: 1 });

    const placeholderRequests: string[] = [];
    page.on('request', (request) => {
      if (/placeholder/i.test(request.url())) placeholderRequests.push(request.url());
    });

    await page.goto('/handlekurv');

    await expect(
      page.getByRole('img', { name: `Ingen bilde av ${PRODUCT.name}` }),
    ).toBeVisible();
    expect(placeholderRequests).toEqual([]);
  });
});
