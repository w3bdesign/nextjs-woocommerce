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

  test('Test at vi kan legge til varen i handlekurven', async ({ page }) => {
    await page.getByRole('link', { name: 'Test simple' }).first().click();

    await page.getByRole('button', { name: 'KJØP' }).click();

   


    await page.screenshot({ path: "handlekurv.png" });

    // Expects that we can see the cart count change

    await expect(page.locator('#header').getByText('1')).toHaveText('1');
  });
});
