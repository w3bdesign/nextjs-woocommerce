import { test, expect } from '@playwright/test';
import {
  SECONDARY_CATEGORY,
  TEST_CATEGORY,
  categoryPath,
} from '@/tests/helpers/testData';

/** Matches a category URL, with or without a query string. */
const categoryUrl = (slug: string) =>
  new RegExp(`${categoryPath(slug)}(?:\\?|$)`);

test.describe('Categories Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate through category pages', async ({ page }) => {
    // Navigate to categories page
    await page.getByRole('link', { name: 'Kategorier' }).click();
    await expect(page).toHaveURL(/\/kategorier$/);

    // Click a category and verify navigation
    await page
      .getByRole('link', { name: SECONDARY_CATEGORY.name, exact: true })
      .click();
    await expect(page).toHaveURL(categoryUrl(SECONDARY_CATEGORY.slug));
    await expect(
      page.getByRole('heading', { name: SECONDARY_CATEGORY.name, exact: true }),
    ).toBeVisible();

    // Go back to categories
    await page.getByRole('link', { name: 'Kategorier' }).click();
    await expect(page).toHaveURL(/\/kategorier$/);

    await page
      .getByRole('link', { name: TEST_CATEGORY.name, exact: true })
      .click();
    await expect(page).toHaveURL(categoryUrl(TEST_CATEGORY.slug));
    await expect(
      page.getByRole('heading', { name: TEST_CATEGORY.name, exact: true }),
    ).toBeVisible();
  });

  test('should navigate between categories and home', async ({ page }) => {
    // Go to categories
    await page.getByRole('link', { name: 'Kategorier' }).click();
    await expect(page).toHaveURL(/\/kategorier$/);

    // Go back home
    await page.getByRole('link', { name: 'NETTBUTIKK' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
