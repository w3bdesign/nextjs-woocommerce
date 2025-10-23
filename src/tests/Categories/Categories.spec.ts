import { expect, test } from '@playwright/test';

test.describe('Categories Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should navigate through category pages', async ({ page }) => {
    // Navigate to categories page
    await page.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL('http://localhost:3000/categories');

    // Click a category and verify navigation
    await page.getByRole('link', { name: 'Sofas' }).click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/category\/sofas/);

    // Go back to categories
    await page.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL('http://localhost:3000/categories');

    // Try another category
    await page.getByRole('link', { name: 'Tables' }).click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/category\/tables/);
  });

  test('should navigate between categories and home', async ({ page }) => {
    // Go to categories
    await page.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL('http://localhost:3000/categories');

    // Go back home
    await page.getByRole('link', { name: 'MEBL FURNITURE' }).click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
