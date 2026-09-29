import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Obecność', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('można wejść w obecność i zapisać', async ({ page }) => {
    await page.goto('/kalendarz');

    // Znajdź pierwszy klikalny trening
    const pierwszyTrening = page.locator('a[href*="/obecnosc"]').first();
    const count = await pierwszyTrening.count();

    if (count === 0) {
      test.skip();
      return;
    }

    await pierwszyTrening.click();
    await page.waitForURL(/\/obecnosc/, { timeout: 10000 });

    await expect(page.locator('h1:has-text("Obecność")')).toBeVisible();
    await expect(page.locator('text=/obecnych na treningu/')).toBeVisible();

    // Zapisz
    await page.click('button:has-text("Zapisz obecność")');
    await page.waitForURL('/kalendarz', { timeout: 10000 });
  });
});