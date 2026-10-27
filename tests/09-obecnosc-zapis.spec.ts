import { test, expect } from '@playwright/test';
import { login, waitForPage } from './helpers';

test.describe('Zapisywanie obecności', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/kalendarz');
    await waitForPage(page);
  });

  test('Zapisanie listy obecności działa i pokazuje toast', async ({ page }) => {
    // Znajdź pierwszy lepszy link do obecności
    const linkObecnosc = page.locator('a[href*="/obecnosc"]').first();
    
    // Jeśli nie ma treningów w bazie, pomiń test
    if (await linkObecnosc.count() === 0) {
      test.skip(true, 'Brak treningów w bazie do przetestowania');
      return;
    }

    await linkObecnosc.click();
    await page.waitForURL(/\/obecnosc/, { timeout: 10000 });

    // Sprawdź, czy są jacyś zawodnicy
    const pierwszyZawodnik = page.locator('button[title="Obecny"]').first();
    if (await pierwszyZawodnik.count() > 0) {
      // Kliknij, aby zmienić status (np. na Nieobecny, potem z powrotem na Obecny)
      await pierwszyZawodnik.click();
      await page.locator('button[title="Nieobecny"]').first().click();
      
      // Wyślij formularz
      const przyciskZapisz = page.locator('button:has-text("Zapisz obecność")');
      await przyciskZapisz.click();

      // Oczekuj przekierowania i toastu
      await page.waitForURL(/\/kalendarz\?toast=obecnosc_zapisana/, { timeout: 15000 });
      await expect(page.locator('text=Obecność zapisana').first()).toBeVisible();
    }
  });
});