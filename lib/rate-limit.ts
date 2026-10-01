import 'server-only';
import { createClient } from '@/lib/supabase/server';

type RateLimitResult =
  | { allowed: true; count: number; max: number }
  | { allowed: false; count: number; max: number; retryAfter: number };

/**
 * Sprawdza rate limit dla danego identyfikatora i akcji.
 *
 * Fail-open: jeśli sam check się wywali, zezwalamy (nie blokujemy userów).
 *
 * @param identifier - np. `user:${userId}` albo `ip:1.2.3.4`
 * @param action - nazwa akcji np. 'dodajTrening'
 * @param max - maksymalna liczba w oknie
 * @param windowSeconds - rozmiar okna w sekundach
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  max: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max: max,
      p_window_seconds: windowSeconds,
    });

    if (error || !data) {
      console.error('Rate limit RPC error:', error);
      return { allowed: true, count: 0, max };
    }

    const result = data as {
      allowed: boolean;
      count: number;
      max: number;
      retry_after?: number;
    };

    if (!result.allowed) {
      return {
        allowed: false,
        count: result.count,
        max: result.max,
        retryAfter: result.retry_after ?? windowSeconds,
      };
    }

    return { allowed: true, count: result.count, max: result.max };
  } catch (err) {
    console.error('Rate limit exception:', err);
    return { allowed: true, count: 0, max };
  }
}

/**
 * Wygodny wrapper: sprawdza rate limit i rzuca błąd jeśli przekroczony.
 * Używać w server actions:
 *
 *   await enforceRateLimit(`user:${user.id}`, 'dodajTrening', 60, 3600);
 */
export async function enforceRateLimit(
  identifier: string,
  action: string,
  max: number,
  windowSeconds: number
): Promise<void> {
  const result = await checkRateLimit(identifier, action, max, windowSeconds);
  if (!result.allowed) {
    const minuty = Math.ceil(result.retryAfter / 60);
    const jednostka = minuty === 1 ? 'minutę' : minuty < 5 ? 'minuty' : 'minut';
    throw new Error(
      `Za dużo operacji. Spróbuj ponownie za ${minuty} ${jednostka}.`
    );
  }
}