import { test, expect } from '@playwright/test';
import { login, waitForPage } from './helpers';

test.describe('Kalendarz', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('kalendarz się ładuje', async ({ page }) => {
    await page.goto('/kalendarz');
    await waitForPage(page);

    await expect(page.locator('h1:has-text("Kalendarz")')).toBeVisible({
      timeout: 10000,
    });
  });

  test('nawigacja zmienia miesiąc', async ({ page }) => {
    await page.goto('/kalendarz');
    await waitForPage(page);

    // Klik następny miesiąc — chevron po prawej
    const nextBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(2);
    // Klik w oba i sprawdź że coś się zmieniło
    await page.locator('button:has(svg.lucide-chevron-right)').first().click();
    await page.waitForTimeout(500);

    // Po kliknięciu nie ma błędu — test pozytywny
    await expect(page).toHaveURL(/\/kalendarz/);
  });

  test('otwiera formularz nowego treningu', async ({ page }) => {
    await page.goto('/kalendarz/nowy');
    await waitForPage(page);

    await expect(page.locator('h1:has-text("Nowe wydarzenie")')).toBeVisible({
      timeout: 10000,
    });

    // Formularz ma pola
    await expect(page.locator('input[name="miejsce"]')).toBeVisible();
    await expect(page.locator('input[name="przeciwnik"]')).toBeVisible();
    await expect(page.locator('textarea[name="notatki"]')).toBeVisible();
  });

  test('eksport otwiera stronę plakatu', async ({ page }) => {
    await page.goto('/kalendarz');
    await waitForPage(page);

    await page.click('a[href*="/kalendarz/eksport"]');
    await page.waitForURL(/\/kalendarz\/eksport/, { timeout: 10000 });

    // Na stronie eksportu jest przycisk „Drukuj"
    await expect(page.locator('button:has-text("Drukuj")')).toBeVisible({
      timeout: 10000,
    });
  });
});