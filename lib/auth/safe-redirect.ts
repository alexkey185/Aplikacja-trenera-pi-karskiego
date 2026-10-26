// lib/auth/safe-redirect.ts
//
// Walidacja parametru `next` w linkach weryfikacyjnych i OAuth.
// Blokuje open redirect (np. https://evil.com) i javascript:/data: URL-e.
//
// Zduplikowana wcześniej w:
//   - app/auth/callback/route.ts
//   - app/auth/confirm/route.ts
// Teraz jedno źródło prawdy.

const ALLOWED_HOSTS = new Set([
  'talentapp.pl',
  'www.talentapp.pl',
  'localhost:3000',
  'localhost:3001',
]);

/**
 * Bezpieczny redirect z parametru URL.
 *
 * - Akceptuje tylko ścieżki relatywne (zaczynające się od pojedynczego "/")
 * - Akceptuje pełne URL-e, ale tylko z białej listy hostów (talentapp.pl, localhost)
 * - Blokuje "//" (protocol-relative), "/\", javascript:, data:, vbscript:, ://
 *
 * @param rawNext - wartość z parametru `next` (może być null)
 * @param fallback - domyślna ścieżka (np. '/dashboard')
 */
export function safeNext(
  rawNext: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!rawNext) return fallback;

  let candidate = rawNext;

  // Jeśli pełny URL - zaakceptuj tylko jeśli host jest z białej listy
  if (/^https?:\/\//i.test(rawNext)) {
    try {
      const url = new URL(rawNext);
      if (!ALLOWED_HOSTS.has(url.host)) {
        return fallback;
      }
      candidate = url.pathname + url.search + url.hash;
    } catch {
      return fallback;
    }
  }

  // Musi zaczynać się od pojedynczego "/"
  if (!candidate.startsWith('/')) return fallback;

  // Blokuj "//" (protocol-relative) i "/\"
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) {
    return fallback;
  }

  // Blokuj cokolwiek z "://"
  if (candidate.includes('://')) return fallback;

  // Blokuj próby javascript:, data:, vbscript:
  const lowered = candidate.toLowerCase();
  if (
    lowered.includes('javascript:') ||
    lowered.includes('data:') ||
    lowered.includes('vbscript:')
  ) {
    return fallback;
  }

  return candidate;
}