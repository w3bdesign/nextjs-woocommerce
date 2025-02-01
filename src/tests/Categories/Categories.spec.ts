import { test, expect } from '@playwright/test';

test.describe('Categories', () => {
  test('should navigate to categories page and verify content', async ({ page }) => {
    // Start from homepage
    await page.goto('http://localhost:3000/');
    
    // Click on Categories link in navigation
    await page.getByRole('link', { name: 'KATEGORIER' }).click();
    
    // Verify URL
    await expect(page).toHaveURL('http://localhost:3000/kategorier');
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Kategorier');
    
    // Verify categories section exists
    await expect(page.locator('section')).toBeVisible();
  });

  test('should navigate back to home from categories', async ({ page }) => {
    // Start from categories page
    await page.goto('http://localhost:3000/kategorier');
    
    // Click on home/logo link
    await page.getByRole('link', { name: 'NETTBUTIKK' }).click();
    
    // Verify we're back on homepage
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
