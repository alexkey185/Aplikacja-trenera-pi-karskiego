import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Import zawodników', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/zawodnicy/import');
  });

  test('Wklejenie CSV poprawnie generuje podgląd', async ({ page }) => {
    const csvData = `Imie,Nazwisko,Rocznik,Numer,Pozycja
Jan,TestowyImport,2012,7,Pomocnik
Adam,CSV,2011,1,Bramkarz`;

    // Znajdź pole tekstowe i wklej dane
    const textarea = page.locator('textarea[name="dane"]');
    await textarea.fill(csvData);

    // Sprawdź, czy wygenerował się podgląd
    await expect(page.locator('text="Podgląd importu"')).toBeVisible();
    
    // Sprawdź, czy system poprawnie odczytał wiersze
    await expect(page.locator('text="Jan"').first()).toBeVisible();
    await expect(page.locator('text="TestowyImport"').first()).toBeVisible();
    await expect(page.locator('text="✓ 2 gotowych"')).toBeVisible();
  });
});