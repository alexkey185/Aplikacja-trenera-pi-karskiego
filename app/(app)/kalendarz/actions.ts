'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';

/**
 * Przenosi trening na inną datę (drag & drop w kalendarzu).
 *
 * Bezpieczeństwo:
 *   - filtr po `druzyna_id` (defense-in-depth obok RLS) — bez tego
 *     każdy zalogowany user mógłby przenieść trening innej drużyny
 *     znając jego `id` (IDOR),
 *   - rate limit 100/h — drag & drop + brak limitu = spam UPDATE-ami,
 *   - walidacja daty: format ISO + realne istnienie (round-trip przez Date),
 *     bo sam regex `^\d{4}-\d{2}-\d{2}$` przepuszcza 2026-31-45.
 */
export async function przeniesTrening(
  id: number,
  newDate: string
): Promise<{ error?: string; success?: boolean }> {
  // ── Walidacja ID ──
  if (!Number.isInteger(id) || id <= 0) {
    return { error: 'Nieprawidłowe ID treningu.' };
  }

  // ── Walidacja daty: format + realne istnienie ──
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    return { error: 'Nieprawidłowy format daty.' };
  }
  const [y, m, d] = newDate.split('-').map(Number);
  const roundTrip = new Date(y, m - 1, d);
  if (
    roundTrip.getFullYear() !== y ||
    roundTrip.getMonth() !== m - 1 ||
    roundTrip.getDate() !== d
  ) {
    return { error: 'Nieprawidłowa data.' };
  }

  // ── Kontekst: aktywna drużyna + user (dla rate limitu) ──
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    return { error: 'Brak aktywnej drużyny.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    try {
      await enforceRateLimit(`user:${user.id}`, 'przeniesTrening', 100, 3600);
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Za dużo operacji.',
      };
    }
  }

  // ── UPDATE z pełnym filtrem (id + druzyna_id) ──
  const { data: updated, error } = await supabase
    .from('treningi')
    .update({ data: newDate })
    .eq('id', id)
    .eq('druzyna_id', druzynaId)
    .select('id')
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  // Brak wiersza = trening nie istnieje LUB należy do innej drużyny.
  // Nie rozróżniamy — nie chcemy zdradzać istnienia cudzych treningów.
  if (!updated) {
    return { error: 'Nie znaleziono treningu.' };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  revalidatePath('/kalendarz/eksport');
  revalidatePath('/statystyki');

  return { success: true };
}