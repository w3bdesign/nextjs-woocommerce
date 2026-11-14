import { test, expect } from '@playwright/test';

test.describe('Forside', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('har nøyaktig én h1 med hero-tittelen', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Stripete Zig Zag Pute Sett');
    await expect(h1).toBeVisible();
  });

  test('hero-bildet vises med alt-tekst', async ({ page }) => {
    await expect(
      page.getByRole('img', {
        name: 'Stripete Zig Zag puter i varme farger, arrangert på en sofa',
      }),
    ).toBeVisible();
  });

  test('"Se Utvalget" leder til produktsiden', async ({ page }) => {
    await page.getByRole('link', { name: 'Se Utvalget' }).click();
    await expect(page).toHaveURL(/\/produkter$/);
    await expect(
      page.getByRole('heading', { name: 'Produkter', exact: true }),
    ).toBeVisible();
  });
});
