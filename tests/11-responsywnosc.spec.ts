import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Widok mobilny (Responsywność)', () => {
  // Ustawiamy rozmiar ekranu na typowy telefon (iPhone 12/13)
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Na telefonie działa dolna nawigacja, a sidebar jest ukryty', async ({ page }) => {
    await page.goto('/dashboard');

    // Sidebar (Desktop) powinien być ukryty
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeVisible();

    // BottomNav (Mobile) powinien być widoczny
    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();

    // Sprawdźmy, czy możemy nawigować z dolnego paska
    await bottomNav.locator('text="Kadra"').click();
    await page.waitForURL('/kadra');
    
    await bottomNav.locator('text="Statystyki"').click();
    await page.waitForURL('/statystyki');
  });
});