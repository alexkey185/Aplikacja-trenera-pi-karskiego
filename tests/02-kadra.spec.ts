import { test, expect } from '@playwright/test';
import { login, TEST_ZAWODNIK } from './helpers';

test.describe('Kadra', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('lista zawodników się ładuje', async ({ page }) => {
    await page.goto('/kadra');
    await expect(page.locator('h1:has-text("LISTA ZAWODNIKÓW")')).toBeVisible();
  });

  test('można dodać zawodnika', async ({ page }) => {
    await page.goto('/zawodnicy/nowy');

    await page.fill('input[name="imie"]', TEST_ZAWODNIK.imie);
    await page.fill('input[name="nazwisko"]', TEST_ZAWODNIK.nazwisko);
    await page.fill('input[name="rocznik"]', TEST_ZAWODNIK.rocznik);
    await page.fill('input[name="numer"]', TEST_ZAWODNIK.numer);

    await page.click('button[type="submit"]');
    await page.waitForURL('/kadra', { timeout: 10000 });

    // Sprawdź czy zawodnik jest na liście
    await expect(
      page.locator(`text=${TEST_ZAWODNIK.imie} ${TEST_ZAWODNIK.nazwisko}`)
    ).toBeVisible();
  });

  test('wyszukiwarka filtruje zawodników', async ({ page }) => {
    await page.goto('/kadra');
    await page.fill('input[name="q"]', 'Kuba');
    await page.press('input[name="q"]', 'Enter');
    await page.waitForLoadState('networkidle');
    // Powinien być co najmniej 1 wynik z "Kuba"
    await expect(page.locator('text=/Kuba/i').first()).toBeVisible();
  });

  test('sortowanie działa', async ({ page }) => {
    await page.goto('/kadra');
    await page.click('a:has-text("Rocznik")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sort=rocznik/);
  });
});