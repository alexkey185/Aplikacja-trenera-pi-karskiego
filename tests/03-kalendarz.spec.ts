import { test, expect } from '@playwright/test';
import { login, waitForPage } from './helpers';

test.describe('Kalendarz', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('kalendarz się ładuje', async ({ page }) => {
    await page.goto('/kalendarz');
    await waitForPage(page);
    await expect(page.locator('h1:has-text("Kalendarz")')).toBeVisible({ timeout: 10000 });
  });

  test('nawigacja zmienia miesiąc', async ({ page }) => {
    await page.goto('/kalendarz');
    await waitForPage(page);
    await page.locator('button:has(svg.lucide-chevron-right)').first().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/kalendarz/);
  });

  test('otwiera formularz nowego treningu', async ({ page }) => {
    await page.goto('/kalendarz/nowy');
    await waitForPage(page);
    await expect(page.locator('h1:has-text("Nowe wydarzenie")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="miejsce"]')).toBeVisible();
  });
});