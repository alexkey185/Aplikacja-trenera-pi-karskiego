import { test, expect } from '@playwright/test';

test.describe('Bezpieczeństwo i ochrona ścieżek', () => {
  // Upewniamy się, że w tym teście jesteśmy wylogowani (czysty kontekst)
  test.use({ storageState: { cookies: [], origins: [] } });

  const chronioneSciezki = [
    '/dashboard',
    '/kadra',
    '/kalendarz',
    '/statystyki',
    '/profil',
    '/druzyny',
    '/zawodnicy/nowy',
  ];

  for (const sciezka of chronioneSciezki) {
    test(`Przekierowanie na login dla niezalogowanego: ${sciezka}`, async ({ page }) => {
      // Próbujemy wejść na chronioną stronę
      await page.goto(sciezka);

      // Oczekujemy, że aplikacja przekieruje nas na ekran logowania
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
      
      // Upewniamy się, że widzimy formularz logowania
      await expect(page.locator('h1:has-text("Zaloguj się")')).toBeVisible();
    });
  }
});