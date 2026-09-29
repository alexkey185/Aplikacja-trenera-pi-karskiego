import { Page } from '@playwright/test';

// ⚠️ ZMIEŃ NA SWOJE DANE TESTOWE
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

// Pomocnicza funkcja — logowanie
export async function login(page: Page) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|kadra/, { timeout: 10000 });
}