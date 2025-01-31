import { test, expect, Page } from '@playwright/test';

test.describe('Produkter', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the cart API response
    await page.route('**/graphql', async (route) => {
      const json = await route.request().postData();
      if (json?.includes('AddToCart')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              addToCart: {
                added: true,
                cartKey: 'test-cart-key',
                cart: {
                  contents: {
                    nodes: [
                      {
                        key: 'test-cart-key',
                        product: {
                          node: {
                            name: 'Test simple',
                            id: '29'
                          }
                        },
                        quantity: 1,
                        total: '100'
                      }
                    ]
                  },
                  total: '100',
                  subtotal: '100',
                  totalProductsCount: 1
                }
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('http://localhost:3000');
  });

  test('Test at vi kan kjøpe produktet', async ({ page }) => {
    await page.getByRole('link', { name: 'Test simple' }).first().click();

    // Expects the URL to contain test-simple
    await page.waitForURL('http://localhost:3000/produkt/test-simple?id=29', {
      waitUntil: 'networkidle',
    });

    await expect(page).toHaveURL(/.*simple/);

    // Verify buy button is visible
    await expect(page.getByRole('button', { name: 'KJØP' })).toBeVisible();

    // Click buy button and wait for the mocked API response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('graphql') && 
      response.request().postData()?.includes('AddToCart')
    );
    await page.getByRole('button', { name: 'KJØP' }).click();
    await responsePromise;

    // Verify cart count updates in header
    await expect(page.locator('#header').getByText('1')).toBeVisible();

    // Navigate to cart
    await page.getByRole('link', { name: 'Handlekurv' }).click();
    await expect(
      page.locator('section').filter({ hasText: 'Handlekurv' })
    ).toBeVisible();

    // Navigate to checkout
    await page.getByRole('button', { name: 'GÅ TIL KASSE' }).click();
    await page.waitForURL('http://localhost:3000/kasse');
    await expect(
      page.locator('section').filter({ hasText: 'Kasse' })
    ).toBeVisible();

    // Test billing form
    await page.getByPlaceholder('Etternavn').fill('testetternavn');
    await expect(page.getByPlaceholder('Etternavn')).toHaveValue('testetternavn');
  });
});
