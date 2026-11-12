import { test, expect } from '@playwright/test';

/**
 * Route smoke tests.
 * Guards the Pages Router → App Router migration: every public route must
 * keep responding with 200 and render its key content.
 */

const PRODUCT_SLUG = 'test-simple';
const PRODUCT_NAME = 'Test Simple';
// "Tskjorter" is the category that currently contains products.
const CATEGORY_SLUG = 'tskjorter';
const CATEGORY_ID = 'dGVybToxNg==';
const CATEGORY_NAME = 'Tskjorter';

const visibleProductLink = (page: import('@playwright/test').Page) =>
  page.locator('a[href^="/produkt/"]').filter({ visible: true }).first();

test.describe('Routes', () => {
  test('/ responds 200 and renders hero and products', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(visibleProductLink(page)).toBeVisible();
  });

  test('/produkter responds 200 and renders product list', async ({ page }) => {
    const response = await page.goto('/produkter');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Produkter', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /Herreklær/ })).toBeVisible();
    await expect(visibleProductLink(page)).toBeVisible();
  });

  test('/kategorier responds 200 and renders category links', async ({
    page,
  }) => {
    const response = await page.goto('/kategorier');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Kategorier', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: CATEGORY_NAME, exact: true }),
    ).toHaveAttribute(
      'href',
      `/kategori/${CATEGORY_SLUG}?id=${encodeURIComponent(CATEGORY_ID)}`,
    );
  });

  test('/produkt/[slug] responds 200 and renders the product', async ({
    page,
  }) => {
    const response = await page.goto(`/produkt/${PRODUCT_SLUG}`);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: PRODUCT_NAME, exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'KJØP' })).toBeVisible();
  });

  test('/kategori/[slug]?id= responds 200 and renders category products', async ({
    page,
  }) => {
    const response = await page.goto(
      `/kategori/${CATEGORY_SLUG}?id=${encodeURIComponent(CATEGORY_ID)}`,
    );
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: CATEGORY_NAME, exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(`a[href="/produkt/${PRODUCT_SLUG}"]`).filter({ visible: true }).first(),
    ).toBeVisible();
  });

  test('/handlekurv responds 200 and renders empty cart state', async ({
    page,
  }) => {
    const response = await page.goto('/handlekurv');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Handlekurv', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Ingen produkter i handlekurven' }),
    ).toBeVisible();
  });

  test('/kasse responds 200 and renders title', async ({ page }) => {
    const response = await page.goto('/kasse');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Kasse', exact: true }),
    ).toBeVisible();
  });

  test('/logg-inn responds 200 and renders login form', async ({ page }) => {
    const response = await page.goto('/logg-inn');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Logg inn', exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel('Brukernavn eller e-post')).toBeVisible();
    await expect(page.getByLabel('Passord')).toBeVisible();
  });
});
