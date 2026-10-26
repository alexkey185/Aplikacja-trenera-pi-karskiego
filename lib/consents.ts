import 'server-only';
import { createClient } from '@/lib/supabase/server';

export const TERMS_VERSION = '1.0';
export const PRIVACY_VERSION = '1.0';

export async function ensureConsentRecord(): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existing } = await supabase
      .from('user_consents')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) return;

    const meta = user.user_metadata ?? {};
    const accepted = meta.accepted_terms === true;

    if (!accepted) {
      console.warn(`User ${user.id} nie zaakceptował regulaminu.`);
      return;
    }

    // P1.1: Walidacja czasu. Jeśli accepted_at jest podejrzane, używamy czasu serwera.
    let acceptedAt = meta.accepted_at as string | undefined;
    if (acceptedAt) {
      const parsed = new Date(acceptedAt);
      const userCreatedAt = new Date(user.created_at);
      // Jeśli data akceptacji jest z przyszłości lub sprzed utworzenia konta (z tolerancją 5 min)
      if (isNaN(parsed.getTime()) || parsed.getTime() > Date.now() + 60000 || parsed.getTime() < userCreatedAt.getTime() - 300000) {
        acceptedAt = new Date().toISOString();
      }
    } else {
      acceptedAt = new Date().toISOString();
    }

    const { error } = await supabase.from('user_consents').insert({
      user_id: user.id,
      terms_version: (meta.terms_version as string) ?? TERMS_VERSION,
      privacy_version: (meta.privacy_version as string) ?? PRIVACY_VERSION,
      accepted_at: acceptedAt,
      user_agent: (meta.signup_user_agent as string) ?? null,
    });

    if (error) {
      console.error('Błąd zapisu zgody RODO:', error.message);
    }
  } catch (err) {
    console.error('Wyjątek przy zapisie zgody RODO:', err);
  }
}