import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Kalendarz', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('kalendarz się ładuje', async ({ page }) => {
    await page.goto('/kalendarz');
    await expect(page.locator('h1:has-text("Kalendarz")')).toBeVisible();
    await expect(page.locator('text=/Wrzesień|Październik|Listopad|Grudzień/')).toBeVisible();
  });

  test('można dodać trening', async ({ page }) => {
    await page.goto('/kalendarz/nowy');

    // Data — jutro
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await page.fill('input[name="data"]', dateStr);
    await page.fill('input[name="godzina"]', '18:00');
    await page.fill('input[name="miejsce"]', 'Boisko testowe');

    await page.click('button[type="submit"]');
    await page.waitForURL('/kalendarz', { timeout: 10000 });
  });

  test('eksport otwiera stronę plakatu', async ({ page }) => {
    await page.goto('/kalendarz');
    await page.click('a:has-text("Eksport")');
    await page.waitForURL(/\/kalendarz\/eksport/, { timeout: 10000 });
    await expect(page.locator('text=KLUB SPORTOWY')).toBeVisible();
    await expect(page.locator('img[alt="KS Wielopole"]')).toBeVisible();
  });
});