'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// ═══════════════════════════════════════════════════════
// Whitelist statusów obecności.
//
// Wartości MUSZĄ być zgodne z tym, co czyta reszta apki:
//   - frekwencja liczy 'obecny' + 'spozniony' jako obecność,
//   - wszystko inne traktuje jako nieobecność.
//
// Bez whitelisty klient mógł wysłać dowolny string (`status_5=admin`),
// który trafiał do bazy i psuł statystyki (śmieć → „nieobecny").
// ═══════════════════════════════════════════════════════
const DOZWOLONE_STATUSY = new Set<string>([
  'obecny',
  'nieobecny',
  'spozniony',
  'usprawiedliwiony',
]);

export async function zapiszObecnosc(treningId: number, formData: FormData) {
  // ── Walidacja ID treningu ──
  if (!Number.isInteger(treningId) || treningId <= 0) {
    throw new Error('Nieprawidłowe ID treningu.');
  }

  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await enforceRateLimit(`user:${user.id}`, 'zapiszObecnosc', 200, 3600);
  }

  // ── Trening musi należeć do aktywnej drużyny ──
  const { data: trening, error: errT } = await supabase
    .from('treningi')
    .select('id')
    .eq('id', treningId)
    .eq('druzyna_id', druzynaId)
    .single();

  if (errT || !trening) {
    throw new Error('Nie znaleziono treningu w aktywnej drużynie.');
  }

  // ── Zawodnicy aktywnej drużyny - do walidacji przynależności ──
  const { data: zawodnicyDruzyny } = await supabase
    .from('zawodnicy')
    .select('id')
    .eq('druzyna_id', druzynaId);

  const dozwoleniIds = new Set((zawodnicyDruzyny ?? []).map((z) => z.id));

  // ═══════════════════════════════════════════════════════
  // Zbieramy wpisy z FormData.
  //
  // Walidacja per wpis:
  //   1. klucz ma format `status_<liczba>` (Number, nie parseInt -
  //      parseInt("5abc") zwracałoby 5),
  //   2. zawodnik należy do aktywnej drużyny,
  //   3. wartość jest w whitelist.
  // ═══════════════════════════════════════════════════════
  const updates: {
    trening_id: number;
    zawodnik_id: number;
    status: string;
  }[] = [];

  let odrzucone = 0;

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('status_')) continue;

    const zawodnikId = Number(key.slice('status_'.length));
    if (!Number.isInteger(zawodnikId) || zawodnikId <= 0) {
      odrzucone++;
      continue;
    }
    if (!dozwoleniIds.has(zawodnikId)) {
      odrzucone++;
      continue;
    }
    if (typeof value !== 'string' || !DOZWOLONE_STATUSY.has(value)) {
      odrzucone++;
      continue;
    }

    updates.push({
      trening_id: treningId,
      zawodnik_id: zawodnikId,
      status: value,
    });
  }

  // ── Brak prawidłowych wpisów ──
  if (updates.length === 0) {
    // Zero wpisów + zero odrzuconych = user nic nie wysłał (np. pusty
    // skład) → cichy powrót. Zero wpisów + coś odrzucone = klient
    // majstrował przy FormData → błąd.
    if (odrzucone > 0) {
      throw new Error('Nieprawidłowe dane obecności.');
    }
    redirect('/kalendarz');
  }

  const { error } = await supabase
    .from('obecnosc')
    .upsert(updates, { onConflict: 'trening_id,zawodnik_id' });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kalendarz');
  revalidatePath(`/kalendarz/${treningId}/obecnosc`);
  revalidatePath('/dashboard');
  revalidatePath('/statystyki');
  redirect('/kalendarz?toast=obecnosc_zapisana');
}