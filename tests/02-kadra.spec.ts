import { test, expect } from '@playwright/test';
import { login, waitForPage, TEST_ZAWODNIK } from './helpers';

test.describe('Kadra', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('lista zawodników się ładuje', async ({ page }) => {
    await page.goto('/kadra');
    await waitForPage(page);

    await expect(
      page.locator('h1:has-text("LISTA ZAWODNIKÓW")')
    ).toBeVisible({ timeout: 10000 });
  });

  test('można dodać zawodnika', async ({ page }) => {
    await page.goto('/zawodnicy/nowy');
    await waitForPage(page);

    // Unikalne dane przy każdym uruchomieniu (unikamy konfliktu UNIQUE)
    const timestamp = Date.now();
    const unikalneNazwisko = `Testowy${timestamp}`;
    const unikalnyNumer = (timestamp % 98) + 1; // 1-99, unikalny per run

    await page.fill('input[name="imie"]', TEST_ZAWODNIK.imie);
    await page.fill('input[name="nazwisko"]', unikalneNazwisko);
    await page.fill('input[name="rocznik"]', TEST_ZAWODNIK.rocznik);
    await page.fill('input[name="numer"]', String(unikalnyNumer));

    await page.click('button[type="submit"]');

    // Czekaj na przekierowanie na /kadra
    await page.waitForURL('/kadra', { timeout: 15000 });

    // Toast „Zawodnik dodany"
    await expect(page.locator('text=Zawodnik dodany')).toBeVisible({
      timeout: 8000,
    });

    // Zawodnik pojawił się na liście
    await expect(page.locator(`text=${unikalneNazwisko}`).first()).toBeVisible({
      timeout: 8000,
    });
  });

  test('wyszukiwarka filtruje zawodników', async ({ page }) => {
    await page.goto('/kadra');
    await waitForPage(page);

    await page.fill('input[name="q"]', 'Test');
    await page.press('input[name="q"]', 'Enter');
    await waitForPage(page);

    await expect(page).toHaveURL(/q=Test/);
  });

  test('sortowanie działa', async ({ page }) => {
    await page.goto('/kadra');
    await waitForPage(page);

    await page.click('a:has-text("Rocznik")');
    await waitForPage(page);

    await expect(page).toHaveURL(/sort=rocznik/);
  });
});