import { test, expect } from '@playwright/test';
import { login, waitForPage } from './helpers';

test.describe('Obecność', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('można wejść w obecność pierwszego treningu', async ({ page }) => {
    await page.goto('/kalendarz');
    await waitForPage(page);

    // Sprawdź czy jest jakikolwiek link do /obecnosc
    const obecnoscLink = page.locator('a[href*="/obecnosc"]').first();
    const istnieje = await obecnoscLink.count();

    if (istnieje === 0) {
      test.skip(true, 'Brak treningów — pomijam test obecności');
      return;
    }

    await obecnoscLink.click();
    await page.waitForURL(/\/obecnosc/, { timeout: 10000 });

    await expect(page.locator('h1:has-text("Obecność")')).toBeVisible({
      timeout: 10000,
    });

    // Sprawdź że jest lista zawodników lub „Brak zawodników"
    const maListe = await page.locator('button[title="Obecny"]').count();
    const brakZawodnikow = await page.locator('text=Brak zawodników').count();
    expect(maListe + brakZawodników).toBeGreaterThan(0);
  });
});