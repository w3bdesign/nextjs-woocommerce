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

    await page.getByRole('button', { name: 'KJØP' }).click();

    await page.locator('#header').getByText('1').waitFor();

    await expect(page.locator('#header').getByText('1')).toBeVisible({
      timeout: 5000,
    });

    await page.getByRole('link', { name: 'Handlekurv' }).click();

    await page.locator('section').filter({ hasText: 'Handlekurv' }).waitFor();

    // Check that that Handlekurv is visible
    await expect(
      page.locator('section').filter({ hasText: 'Handlekurv' })
    ).toBeVisible();

    // Check that we can go to Kasse

    await page.getByRole('button', { name: 'GÅ TIL KASSE' }).click();

    await page.waitForURL('http://localhost:3000/kasse', {
      waitUntil: 'networkidle',
    });

    await expect(
      page.locator('section').filter({ hasText: 'Kasse' })
    ).toBeVisible();

    await page.getByPlaceholder('Etternavn').fill('testetternavn');

    await page.getByPlaceholder('Etternavn').waitFor();

    await expect(page.getByPlaceholder('Etternavn')).toHaveValue(
      'testetternavn'
    );
  });
});
