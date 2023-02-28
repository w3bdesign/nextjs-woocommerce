import { test, expect } from '@playwright/test';

test.describe('Produkter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Test at vi kan gå til Test Simple produktet og se at tittel er synlig', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Test simple' }).first().click();

    // Expects the URL to contain simple
    await expect(page).toHaveURL(/.*simple/);
  });

  test('Test at kjøp knappen er synlig', async ({ page }) => {
    await page.getByRole('link', { name: 'Test simple' }).first().click();

    // Expects the URL to contain test-simple
    await page.waitForURL(/.*simple/);

    await expect(page.getByRole('button', { name: 'KJØP' })).toBeVisible();
  });

  test('Test at vi kan kjøpe produktet', async ({ page }) => {
    await page.getByRole('link', { name: 'Test simple' }).first().click();

    // Expects the URL to contain test-simple
    await page.waitForURL(/.*simple/);   

    await page.waitForTimeout(3000);    

    await page.getByRole('button', { name: 'KJØP' }).click();

    await page.waitForTimeout(3000);

    await expect(page.locator('#header').getByText('1')).toBeVisible({
      timeout: 5000,
    });
  });
});
