import { test, expect, Page, Route } from '@playwright/test';

test.describe('Produkter', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Mock GraphQL responses
    await page.route('**/graphql', async (route: Route) => {
      const postData = route.request().postData();
      
      // Mock successful response for all GraphQL requests
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            products: {
              nodes: [{
                id: '29',
                name: 'Test simple',
                price: '100'
              }]
            }
          }
        })
      });
    });

    await page.goto('http://localhost:3000');
  });

  test('basic product purchase flow', async ({ page }: { page: Page }) => {
    // Click first product
    await page.getByRole('link', { name: 'Test simple' }).click();
    
    // Wait for product page to load
    await expect(page.getByRole('button', { name: 'KJØP' })).toBeVisible();
    
    // Click buy button
    await page.getByRole('button', { name: 'KJØP' }).click();
    
    // Go to cart
    await page.getByRole('link', { name: 'Handlekurv' }).click();
    
    // Verify cart page loaded
    await expect(page.getByRole('button', { name: 'GÅ TIL KASSE' })).toBeVisible();
    
    // Go to checkout
    await page.getByRole('button', { name: 'GÅ TIL KASSE' }).click();
    
    // Fill in a test field to verify form is accessible
    await page.getByPlaceholder('Etternavn').fill('testetternavn');
    await expect(page.getByPlaceholder('Etternavn')).toHaveValue('testetternavn');
  });
});
