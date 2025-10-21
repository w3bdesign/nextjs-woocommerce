import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Has h1 content on home page', async ({ page }) => {
    const h1 = await page.locator('h1');
    const count = await h1.count();
    await expect(count).toBeGreaterThan(0);
  });
});
