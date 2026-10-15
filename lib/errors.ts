// ═══════════════════════════════════════════════════════════
// Centralne mapowanie błędów Supabase na polskie komunikaty
//
// Supabase zwraca błędy w formie obiektu z polami:
//   - message: surowy tekst (np. "Invalid login credentials")
//   - status: kod HTTP (400, 401, 500)
//   - code:   kod Supabase (np. "invalid_credentials")
//   - name:   "AuthApiError" itp.
//
// Mapujemy po fragmencie message (małe litery) oraz po code.
// ═══════════════════════════════════════════════════════════

type SupabaseError = {
  message?: string;
  code?: string;
  status?: number;
} | null | undefined;

// ── Mapa: fragment kodu/message → polski komunikat ──
const ERROR_MAP: Array<{ match: string[]; pl: string }> = [
  // ── Login ──
  { match: ['invalid login credentials', 'invalid_credentials'], pl: 'Nieprawidłowy email lub hasło' },
  { match: ['email not confirmed', 'email_not_confirmed'], pl: 'Najpierw potwierdź swój email (sprawdź skrzynkę)' },

  // ── Rejestracja ──
  { match: ['user already registered', 'already been registered', 'user_already_exists'], pl: 'Konto z tym adresem email już istnieje. Zaloguj się' },
  { match: ['signup disabled', 'signups not allowed'], pl: 'Rejestracja jest tymczasowo wyłączona' },
  { match: ['email_address_invalid', 'invalid email'], pl: 'Adres email jest nieprawidłowy' },

  // ── Hasło ──
  { match: ['password should be at least', 'password is too short', 'weak_password'], pl: 'Hasło jest za krótkie (min. 8 znaków)' },
  { match: ['password should contain', 'password_too_weak'], pl: 'Hasło musi zawierać litery, cyfry i znaki specjalne' },
  { match: ['same password', 'should be different'], pl: 'Nowe hasło musi się różnić od poprzedniego' },
  { match: ['password_too_long'], pl: 'Hasło jest za długie (max 72 znaki)' },

  // ── Sesja ──
  { match: ['session', 'not authenticated', 'jwt expired', 'invalid token'], pl: 'Sesja wygasła. Zaloguj się ponownie' },
  { match: ['refresh token', 'refresh_token_not_found'], pl: 'Sesja wygasła. Zaloguj się ponownie' },

  // ── Rate limit ──
  { match: ['too many requests', 'rate limit', 'over_request_rate_limit', 'over_email_send_rate_limit'], pl: 'Zbyt wiele prób. Spróbuj ponownie za chwilę' },

  // ── Potwierdzenie / linki ──
  { match: ['token has expired', 'otp_expired'], pl: 'Link wygasł. Poproś o nowy' },
  { match: ['invalid otp', 'otp_disabled'], pl: 'Nieprawidłowy kod weryfikacji' },
  { match: ['email link is invalid', 'otp_already_used'], pl: 'Link został już użyty lub jest nieprawidłowy' },

  // ── Uprawnienia ──
  { match: ['not authorized', 'permission denied', 'rls'], pl: 'Brak dostępu do tego zasobu' },
  { match: ['forbidden'], pl: 'Brak dostępu' },

  // ── Baza / sieć ──
  { match: ['duplicate key', 'unique constraint'], pl: 'Taki wpis już istnieje' },
  { match: ['foreign key', 'foreign_key_violation'], pl: 'Nie można wykonać - powiązane dane nie istnieją' },
  { match: ['network', 'fetch', 'failed to fetch'], pl: 'Błąd połączenia. Sprawdź internet' },
  { match: ['timeout', 'timed out'], pl: 'Serwer nie odpowiada. Spróbuj ponownie' },
  { match: ['internal server error', 'server error'], pl: 'Błąd serwera. Spróbuj ponownie za chwilę' },
];

/**
 * Tłumaczy błąd Supabase (lub dowolny Error) na polski komunikat.
 *
 * Użycie:
 *   try {
 *     const { error } = await supabase.auth.signInWithPassword({...});
 *     if (error) throw error;
 *   } catch (err) {
 *     setError(getErrorMessage(err));
 *   }
 */
export function getErrorMessage(error: unknown): string {
  // Wyciągnij message + code z różnych form błędów
  let message = '';
  let code = '';

  if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    const e = error as SupabaseError;
    message = e?.message ?? '';
    code = e?.code ?? '';
  }

  if (!message && !code) {
    return 'Wystąpił nieoczekiwany błąd';
  }

  const haystack = `${code} ${message}`.toLowerCase();

  // Znajdź pierwszy pasujący wpis
  for (const entry of ERROR_MAP) {
    if (entry.match.some((m) => haystack.includes(m))) {
      return entry.pl;
    }
  }

  // Fallback - zwróć oryginalny komunikat (nie tracimy informacji)
  return message || 'Wystąpił nieoczekiwany błąd';
}

/**
 * Wariant tylko dla błędów auth (login, signup, reset).
 * Zostawiony dla kompatybilności z istniejącym kodem.
 */
export function getAuthErrorMessage(error: unknown): string {
  return getErrorMessage(error);
}

// ═══════════════════════════════════════════════════════════
// Komunikaty z parametru ?error= w URL (dla /auth/error)
// Mapujemy kody/tokeny żeby nie wyświetlać surowego tekstu
// ═══════════════════════════════════════════════════════════
const URL_ERROR_MAP: Record<string, string> = {
  'no token hash or type': 'Brak wymaganych danych w linku weryfikacyjnym',
  'no_token_hash_or_type': 'Brak wymaganych danych w linku weryfikacyjnym',
  'invalid_token': 'Link weryfikacyjny jest nieprawidłowy lub wygasł',
  'expired_token': 'Link weryfikacyjny wygasł. Poproś o nowy',
  'otp_expired': 'Kod weryfikacyjny wygasł. Poproś o nowy',
  'access_denied': 'Dostęp został zablokowany',
  'email_not_confirmed': 'Email nie został jeszcze potwierdzony',
  'user_not_found': 'Nie znaleziono konta',
};

/**
 * Tłumaczy surowy tekst z URL na czytelny polski komunikat.
 * Używa się w /auth/error/page.tsx
 */
export function translateUrlError(raw: string | null | undefined): string {
  if (!raw) return 'Wystąpił nieznany błąd';

  const decoded = decodeURIComponent(raw).toLowerCase().trim();

  // Znajdź pierwszy pasujący wpis URL
  for (const [key, pl] of Object.entries(URL_ERROR_MAP)) {
    if (decoded.includes(key.replace(/_/g, ' ')) || decoded.includes(key)) {
      return pl;
    }
  }

  // Fallback - najpierw spróbuj tłumaczyć przez ogólną mapę
  const generic = getErrorMessage({ message: raw });
  if (generic !== raw) return generic;

  // Ostatecznie - pokaż ogólny komunikat (bez surowego tekstu z URL)
  return 'Wystąpił błąd podczas weryfikacji. Spróbuj ponownie lub skontaktuj się z pomocą';
}