import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers';

test.describe('Logowanie', () => {
  test('błędne dane logowania pokazują błąd', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'zle@nie.ma');
    await page.fill('input[type="password"]', 'ZleHaslo123!');
    await page.click('button[type="submit"]');

    // POPRAWKA: Filtrujemy alerty, aby upewnić się, że wybieramy ten z naszym tekstem.
    const alertBlad = page.getByRole('alert').filter({ hasText: /nieprawidłowy/i });
    
    await expect(alertBlad).toBeVisible({ timeout: 20000 });
  });

  test('poprawne logowanie przenosi na dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/(dashboard|druzyny\/nowa)/, { timeout: 20000 });
    
    if (page.url().includes('/dashboard')) {
      await expect(page.locator('h1', { hasText: 'Dzisiaj' })).toBeVisible({ timeout: 10000 });
    }
  });
});