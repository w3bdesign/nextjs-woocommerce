import { test, expect } from '@playwright/test';

test.describe('Produkter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Test at vi kan kjøpe produktet', async ({ page }) => {
    await page.getByRole('link', { name: 'Test simple' }).first().click();

    // Expects the URL to contain test-simple
    await page.waitForURL('http://localhost:3000/produkt/test-simple?id=29', {
      waitUntil: 'networkidle',
    });

    await expect(page).toHaveURL(/.*simple/);

    await expect(page.getByRole('button', { name: 'KJØP' })).toBeVisible();

    // Click the buy button and wait for it to complete
    await page.getByRole('button', { name: 'KJØP' }).click();
    
    // Wait for network idle to ensure any API calls complete
    await page.waitForLoadState('networkidle');

    // More specific selector for the cart count and consistent timeout
    const cartCountSelector = '#header';
    
    // Wait for cart count to be visible and equal to "1"
    await expect(page.locator(cartCountSelector).getByText('1')).toBeVisible({
      timeout: 30000
    });

    await page.getByRole('link', { name: 'Handlekurv' }).click();

    await page.locator('section').filter({ hasText: 'Handlekurv' }).waitFor();

    // Check that that Handlekurv is visible
    await expect(
      page.locator('section').filter({ hasText: 'Handlekurv' }),
    ).toBeVisible();

    // Check that we can go to Kasse

    await page.getByRole('button', { name: 'GÅ TIL KASSE' }).click();

    await page.waitForURL('http://localhost:3000/kasse', {
      waitUntil: 'networkidle',
    });

    await expect(
      page.locator('section').filter({ hasText: 'Kasse' }),
    ).toBeVisible();

    // Check that we can type something in Billing fields

    await page.getByPlaceholder('Etternavn').fill('testetternavn');

    await page.getByPlaceholder('Etternavn').waitFor();

    await expect(page.getByPlaceholder('Etternavn')).toHaveValue(
      'testetternavn',
    );
  });
});
