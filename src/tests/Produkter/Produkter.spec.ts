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
    await page.waitForURL(/.*test-simple/);

    await expect(page.getByRole('button', { name: 'KJØP' })).toBeVisible();
  });
});
