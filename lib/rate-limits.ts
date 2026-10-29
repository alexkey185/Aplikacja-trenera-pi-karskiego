// lib/rate-limits.ts - Centralne stale dla rate limitow (QUAL-02)
// Zamiast magic numbers (100/3600, 60/3600) rozsiane po 7 plikach,
// mamy jedna definicje tutaj.

export const RATE_LIMITS = {
  zapiszWynikLubNotatke: { max: 100, windowSec: 3600 },
  dodajDruzyna:           { max: 10,  windowSec: 3600 },
  dodajZawodnika:         { max: 30,  windowSec: 3600 },
  dodajTrening:           { max: 60,  windowSec: 3600 },
  aktualizujTrening:      { max: 100, windowSec: 3600 },
  usunTreningZakres:      { max: 50,  windowSec: 3600 },
  zapiszObecnosc:          { max: 200, windowSec: 3600 },
  przeniesTrening:         { max: 100, windowSec: 3600 },
  uploadLogo:              { max: 10,  windowSec: 3600 },
  importZawodnicy:        { max: 5,   windowSec: 3600 },
  exportBackup:            { max: 3,   windowSec: 3600 }, // SEC-03
  zapiszZgode:             { max: 30,  windowSec: 3600 }, // RODO-01
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

/**
 * Helper - wywolaj zamiast enforceRateLimit z 4 argumentami.
 * Przyklad:
 *   await enforceRateLimitByKey(`user:${user.id}`, 'dodajZawodnika');
 */
export async function enforceRateLimitByKey(
  userId: string,
  key: RateLimitKey
): Promise<void> {
  // Lazy import zeby uniknac circular dependency jesli lib/rate-limit
  // zaimportuje z tego pliku w przyszlosci
  const { enforceRateLimit } = await import('@/lib/rate-limit');
  const cfg = RATE_LIMITS[key];
  return enforceRateLimit(userId, key, cfg.max, cfg.windowSec);
}

/**
 * Helper analogiczny do checkRateLimit (zwraca bool, nie rzuca).
 */
export async function checkRateLimitByKey(
  userId: string,
  key: RateLimitKey
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const { checkRateLimit } = await import('@/lib/rate-limit');
  const cfg = RATE_LIMITS[key];
  return checkRateLimit(userId, key, cfg.max, cfg.windowSec);
}
