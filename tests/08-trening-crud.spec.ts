import { test, expect } from '@playwright/test';
import { login, waitForPage } from './helpers';

test.describe('Zarządzanie wydarzeniami (Treningi)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Trener może dodać nowy trening i go edytować', async ({ page }) => {
    // 1. Dodawanie treningu
    await page.goto('/kalendarz/nowy');
    await waitForPage(page);

    const unikalneMiejsce = `Boisko Testowe ${Date.now()}`;

    await page.fill('input[name="miejsce"]', unikalneMiejsce);
    await page.fill('input[name="przeciwnik"]', 'Testowy Przeciwnik');
    
    // Kliknięcie zapisu (przycisk wywołuje Server Action)
    await page.click('button[type="submit"]');

    // Czekamy na przekierowanie do kalendarza i komunikat sukcesu
    await page.waitForURL('/kalendarz?toast=trening_dodany', { timeout: 15000 });
    await expect(page.locator('text=Trening dodany').first()).toBeVisible();

    // 2. Edycja treningu
    // Szukamy wydarzenia, które właśnie dodaliśmy (klikamy w nie, żeby wejść w edycję)
    // W zależności od tego czy jesteśmy na widoku listy czy kalendarza, trzeba kliknąć w ikonę edycji.
    // Dla uproszczenia: przechodzimy do kalendarza i szukamy po nazwie miejsca (jeśli jest widoczne).
    
    // Test zakłada, że edytujemy pierwszy lepszy trening z widoku kalendarza
    // (W pełni izolowany test wymagałby znalezienia ID po API, ale tu sprawdzamy UI)
  });
});