import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers';

test.describe('Logowanie', () => {
  test('błędne dane logowania pokazują błąd', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'zle@nie.ma');
    await page.fill('input[type="password"]', 'ZleHaslo123!');
    await page.click('button[type="submit"]');

    // Powinien pokazać błąd (alert albo komunikat)
    await expect(page.locator('text=/błąd|nieprawidłowe|invalid/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('poprawne logowanie przenosi na dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1:has-text("Tydzień")')).toBeVisible({ timeout: 10000 });
  });
});