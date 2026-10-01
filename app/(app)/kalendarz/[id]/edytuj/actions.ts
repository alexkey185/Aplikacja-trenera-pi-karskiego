'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { aktualizujTreningSchema, parseFormData } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

// ══════════════════════════════════════════════
// AKTUALIZACJA TRENINGU — single lub cała seria
// ══════════════════════════════════════════════
export async function aktualizujTrening(
  id: number,
  scope: 'single' | 'all',
  formData: FormData
): Promise<{ success: true; scope: 'single' | 'all' }> {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  // Rate limit: max 100 edycji treningów / godzinę
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await enforceRateLimit(`user:${user.id}`, 'aktualizujTrening', 100, 3600);
  }

  // Walidacja Zod
  const parsed = parseFormData(aktualizujTreningSchema, formData);
  const { data, godzina, miejsce, typ, przeciwnik, notatki } = parsed;

  const { data: trening, error: errFetch } = await supabase
    .from('treningi')
    .select('id, cykl_id')
    .eq('id', id)
    .eq('druzyna_id', druzynaId)
    .single();

  if (errFetch || !trening) {
    throw new Error('Nie znaleziono treningu w aktywnej drużynie.');
  }

  if (scope === 'single' || !trening.cykl_id) {
    const { error } = await supabase
      .from('treningi')
      .update({ data, godzina, miejsce, typ, przeciwnik, notatki })
      .eq('id', id)
      .eq('druzyna_id', druzynaId);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from('treningi')
      .update({
        godzina,
        miejsce,
        typ,
        przeciwnik,
        notatki,
      })
      .eq('cykl_id', trening.cykl_id)
      .eq('druzyna_id', druzynaId);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  revalidatePath('/kalendarz/eksport');
  revalidatePath('/statystyki');

  return { success: true, scope: trening.cykl_id && scope === 'all' ? 'all' : 'single' };
}

// ══════════════════════════════════════════════
// USUWANIE TRENINGU — z opcją całej serii
// Zwraca { success } lub { error }, bez throw
// ══════════════════════════════════════════════
export async function usunTreningZakres(
  id: number,
  scope: 'single' | 'all'
): Promise<{ success: true; count: number } | { error: string }> {
  if (!id || isNaN(id)) {
    return { error: 'Nieprawidłowe ID.' };
  }

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    return { error: 'Brak aktywnej drużyny.' };
  }

  // Rate limit: max 50 usunięć / godzinę
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const rl = await checkRateLimit(
      `user:${user.id}`,
      'usunTreningZakres',
      50,
      3600
    );
    if (!rl.allowed) {
      const minuty = Math.ceil(rl.retryAfter / 60);
      return {
        error: `Za dużo operacji. Spróbuj ponownie za ${minuty} min.`,
      };
    }
  }

  const { data: trening, error: errFetch } = await supabase
    .from('treningi')
    .select('id, cykl_id')
    .eq('id', id)
    .eq('druzyna_id', druzynaId)
    .single();

  if (errFetch || !trening) {
    return { error: 'Nie znaleziono treningu.' };
  }

  let count = 0;

  if (scope === 'all' && trening.cykl_id) {
    const { error, count: deletedCount } = await supabase
      .from('treningi')
      .delete({ count: 'exact' })
      .eq('cykl_id', trening.cykl_id)
      .eq('druzyna_id', druzynaId);

    if (error) {
      return { error: error.message };
    }
    count = deletedCount ?? 0;
  } else {
    const { error, count: deletedCount } = await supabase
      .from('treningi')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('druzyna_id', druzynaId);

    if (error) {
      return { error: error.message };
    }
    count = deletedCount ?? 0;
  }

  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  revalidatePath('/kalendarz/eksport');
  revalidatePath('/statystyki');

  return { success: true, count };
}

// ══════════════════════════════════════════════
// STARA WERSJA — dla kompatybilności
// ══════════════════════════════════════════════
export async function usunTrening(formData: FormData) {
  const idStr = formData.get('id') as string;
  const id = parseInt(idStr, 10);

  if (!id || isNaN(id)) {
    throw new Error('Nieprawidłowe ID.');
  }

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('treningi')
    .delete()
    .eq('id', id)
    .eq('druzyna_id', druzynaId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  revalidatePath('/kalendarz/eksport');
  revalidatePath('/statystyki');
}