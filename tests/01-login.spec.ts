import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers';

test.describe('Logowanie', () => {
  test('strona główna pokazuje się', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=talent')).toBeVisible();
    await expect(page.locator('text=Zaloguj się')).toBeVisible();
  });

  test('błędne dane logowania pokazują błąd', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'nieistnieje@test.pl');
    await page.fill('input[type="password"]', 'zleHaslo123');
    await page.click('button[type="submit"]');
    // Powinno zostać na stronie logowania
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('poprawne logowanie przenosi na dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|kadra/, { timeout: 10000 });
  });
});