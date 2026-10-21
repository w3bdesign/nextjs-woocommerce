import { test, expect } from '@playwright/test';

test.describe('Categories Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should navigate through category pages', async ({ page }) => {
    // Navigate to categories page
    await page.getByRole('link', { name: 'Kategorier' }).click();
    await expect(page).toHaveURL('http://localhost:3000/kategorier');

    // Click a category and verify navigation
    await page.getByRole('link', { name: 'Clothing' }).click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/kategori\/clothing/);
    await expect(
      page.getByRole('heading', { name: 'Clothing', exact: true }),
    ).toBeVisible();

    // Go back to categories
    await page.getByRole('link', { name: 'Kategorier' }).click();
    await expect(page).toHaveURL('http://localhost:3000/kategorier');

    // Use the category's current WooCommerce name and slug.
    await page.getByRole('link', { name: 'Tskjorter', exact: true }).click();
    await expect(page).toHaveURL(
      /^http:\/\/localhost:3000\/kategori\/tskjorter(?:\?|$)/,
    );
    await expect(
      page.getByRole('heading', { name: 'Tskjorter', exact: true }),
    ).toBeVisible();
  });

  test('should navigate between categories and home', async ({ page }) => {
    // Go to categories
    await page.getByRole('link', { name: 'Kategorier' }).click();
    await expect(page).toHaveURL('http://localhost:3000/kategorier');

    // Go back home
    await page.getByRole('link', { name: 'NETTBUTIKK' }).click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
