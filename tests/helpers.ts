import { Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: 'test@test.pl',
  password: 'Testowe123!',
};

export const TEST_ZAWODNIK = {
  imie: 'Jan',
  nazwisko: 'Testowy',
  rocznik: '2020',
  numer: '99',
};

/**
 * Loguje użytkownika testowego i czeka na dashboard.
 * Rzuca błąd jeśli logowanie się nie udało.
 */
export async function login(page: Page) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 15000 });
}

/**
 * Czeka aż strona się "ustabilizuje" (networkidle).
 */
export async function waitForPage(page: Page) {
  await page.waitForLoadState('networkidle');
}