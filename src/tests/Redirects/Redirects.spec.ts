import { test, expect } from '@playwright/test';

/**
 * Redirect and error-status regression tests.
 */

test.describe('Redirects and status codes', () => {
  for (const path of ['/produkt/test-simple', '/kategori/tskjorter']) {
    test(`legacy ${path}?id= URL permanently redirects (301) to clean slug`, async ({
      request,
    }) => {
      const response = await request.get(`${path}?id=123`, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toMatch(
        new RegExp(`^(http://localhost:3000)?${path}$`),
      );
    });
  }

  test('unknown route responds 404', async ({ request }) => {
    const response = await request.get('/denne-siden-finnes-ikke');
    expect(response.status()).toBe(404);
  });

  /*
   * Pages stream behind the root `loading.tsx`, so `notFound()` may not be able
   * to change an already-sent 200 status. Next then renders the not-found UI
   * with `noindex`, so the page is not indexed.
   */
  for (const path of ['/produkt/finnes-ikke-produkt', '/kategori/finnes-ikke-kategori']) {
    test(`${path} renders not-found page with noindex`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBeLessThan(500);
      const html = await response.text();
      expect(html).toContain('This page could not be found');
      expect(html).toMatch(/<meta name="robots" content="noindex"\/?>/);
    });
  }

  test('/min-konto redirects anonymous users to /logg-inn', async ({ page }) => {
    await page.goto('/min-konto');
    await expect(page).toHaveURL(/\/logg-inn$/);
    await expect(
      page.getByRole('heading', { name: 'Logg inn', exact: true }),
    ).toBeVisible();
  });
});
