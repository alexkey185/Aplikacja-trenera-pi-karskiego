// lib/demo.ts
import { createClient } from '@/lib/supabase/server';

export const DEMO_EMAIL = 'demo@talentapp.pl';

/**
 * Sprawdza czy aktualnie zalogowany user to konto demo.
 * Używa getUser z server, więc działa w Server Actions.
 */
export async function isDemoMode(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email === DEMO_EMAIL;
}

/**
 * Wariant dla formularzy klienckich — sprawdza URL lub cookie.
 */
export function isDemoModeClient(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === 'true') return true;
  return document.cookie.split(';').some((c) => c.trim().startsWith('demo_mode='));
}