import { test, expect } from '@playwright/test';
import { login, waitForPage } from './helpers';

test.describe('Statystyki', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('widok statystyk ładuje się poprawnie', async ({ page }) => {
    await page.goto('/statystyki');
    await waitForPage(page);

    // Sprawdzamy czy nagłówek się załadował
    await expect(page.locator('h1:has-text("Statystyki")')).toBeVisible({ timeout: 10000 });

    // Sprawdzamy czy kafelki (nowy komponent StatystykiClient) się wyrenderowały
    await expect(page.locator('text="Frekwencja"').first()).toBeVisible();
    await expect(page.locator('text="Treningi"').first()).toBeVisible();
    await expect(page.locator('text="Zawodnicy"').first()).toBeVisible();

    // Sprawdzamy czy sekcja wykresu jest widoczna
    await expect(page.locator('text="Frekwencja - ostatnie 6 miesięcy"')).toBeVisible();
    
    // Sprawdzamy czy ranking się wyrenderował
    await expect(page.locator('text="Ranking zawodników"')).toBeVisible();
  });

  test('zmiana okresu działa i nie wyrzuca błędu', async ({ page }) => {
    await page.goto('/statystyki');
    await waitForPage(page);

    // Klikamy przycisk presetu "Ostatnie 30 dni" (na desktopie)
    const presetBtn = page.locator('a:has-text("Ostatnie 30 dni")').first();
    if (await presetBtn.isVisible()) {
        await presetBtn.click();
        
        // Czekamy na przeładowanie i sprawdzamy czy URL się zmienił
        await waitForPage(page);
        await expect(page).toHaveURL(/okres=30dni/);
        
        // Upewniamy się, że nie ma ekranu błędu (Error Boundary)
        await expect(page.locator('text="Coś poszło nie tak"')).not.toBeVisible();
    }
  });
});