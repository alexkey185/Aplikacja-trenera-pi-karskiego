'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { isDemoMode } from '@/lib/demo';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const DOZWOLONE_STATUSY = new Set<string>([
  'obecny',
  'nieobecny',
  'spozniony',
  'usprawiedliwiony',
]);

export async function zapiszObecnosc(treningId: number, formData: FormData) {
  if (await isDemoMode()) {
    throw new Error('W wersji demo nie zapisujemy zmian. Załóż konto, aby korzystać z aplikacji.');
  }

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

  const { data: trening, error: errT } = await supabase
    .from('treningi')
    .select('id')
    .eq('id', treningId)
    .eq('druzyna_id', druzynaId)
    .single();

  if (errT || !trening) {
    throw new Error('Nie znaleziono treningu w aktywnej drużynie.');
  }

  const { data: zawodnicyDruzyny } = await supabase
    .from('zawodnicy')
    .select('id')
    .eq('druzyna_id', druzynaId);

  const dozwoleniIds = new Set((zawodnicyDruzyny ?? []).map((z) => z.id));

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

  if (updates.length === 0) {
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