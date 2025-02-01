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
    await expect(page).toHaveURL('http://localhost:3000/kategori/clothing');

    // Go back to categories
    await page.getByRole('link', { name: 'Kategorier' }).click();
    await expect(page).toHaveURL('http://localhost:3000/kategorier');

    // Try another category
    await page.getByRole('link', { name: 'Tshirts' }).click();
    await expect(page).toHaveURL('http://localhost:3000/kategori/tshirts');
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
