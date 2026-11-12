import { test, expect } from '@playwright/test';

/**
 * Redirect and error-status regression tests.
 */

test.describe('Redirects and status codes', () => {
  test('legacy /produkt/[slug]?id= URL permanently redirects (301) to clean slug', async ({
    request,
  }) => {
    const response = await request.get('/produkt/test-simple?id=123', {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toMatch(
      /^(http:\/\/localhost:3000)?\/produkt\/test-simple$/,
    );
  });

  test('unknown route responds 404', async ({ request }) => {
    const response = await request.get('/denne-siden-finnes-ikke');
    expect(response.status()).toBe(404);
  });

  test('/min-konto redirects anonymous users to /logg-inn', async ({ page }) => {
    await page.goto('/min-konto');
    await expect(page).toHaveURL(/\/logg-inn$/);
    await expect(
      page.getByRole('heading', { name: 'Logg inn', exact: true }),
    ).toBeVisible();
  });
});
