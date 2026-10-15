import 'server-only';
import { createClient } from '@/lib/supabase/server';

// ═══════════════════════════════════════════════════════
// Wersje dokumentów - zmień gdy aktualizujesz treść
// ═══════════════════════════════════════════════════════
export const TERMS_VERSION = '1.0';
export const PRIVACY_VERSION = '1.0';

/**
 * Zapewnia że istnieje rekord zgody dla zalogowanego usera.
 *
 * Flow:
 *   1. sign-up form zapisuje zgodę do user_metadata (accepted_terms, accepted_at, itd.)
 *   2. Po potwierdzeniu emaila user ma sesję
 *   3. Ta funkcja odczytuje user_metadata i zapisuje do tabeli user_consents
 *
 * Idempotentne - jeśli rekord istnieje, nic nie robi.
 * Fail-safe - błędy logujemy, ale nie przerywamy pracy.
 */
export async function ensureConsentRecord(): Promise<void> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Sprawdź czy już istnieje
    const { data: existing } = await supabase
      .from('user_consents')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) return;

    // Odczytaj zgodę z user_metadata
    const meta = user.user_metadata ?? {};
    const accepted = meta.accepted_terms === true;

    if (!accepted) {
      // User nie zaakceptował (np. legacy konto) - nie zapisujemy
      return;
    }

    // Zapisz do tabeli
    const { error } = await supabase.from('user_consents').insert({
      user_id: user.id,
      terms_version: (meta.terms_version as string) ?? TERMS_VERSION,
      privacy_version: (meta.privacy_version as string) ?? PRIVACY_VERSION,
      accepted_at: (meta.accepted_at as string) ?? new Date().toISOString(),
      user_agent: (meta.signup_user_agent as string) ?? null,
    });

    if (error) {
      console.error('Błąd zapisu zgody RODO:', error.message);
    }
  } catch (err) {
    console.error('Wyjątek przy zapisie zgody RODO:', err);
  }
}