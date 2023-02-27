import { test, expect } from '@playwright/test';

test.describe('Forside', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Har h1 innhold på forsiden', async ({ page }) => {    
    const h1 = await page.locator('h1');
    const count = await h1.count();
    await expect(count).toBeGreaterThan(0);
  });
});
