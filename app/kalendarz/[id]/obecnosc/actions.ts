'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function zapiszObecnosc(treningId: number, formData: FormData) {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  // Weryfikacja: trening należy do aktywnej drużyny
  const { data: trening, error: errT } = await supabase
    .from('treningi')
    .select('id')
    .eq('id', treningId)
    .eq('druzyna_id', druzynaId)
    .single();

  if (errT || !trening) {
    throw new Error('Nie znaleziono treningu w aktywnej drużynie.');
  }

  // Pobierz listę zawodników z tej drużyny (żeby odfiltrować próby zapisu cudzych)
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

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('status_')) {
      const zawodnikId = parseInt(key.replace('status_', ''), 10);
      if (!isNaN(zawodnikId) && dozwoleniIds.has(zawodnikId)) {
        updates.push({
          trening_id: treningId,
          zawodnik_id: zawodnikId,
          status: value as string,
        });
      }
    }
  }

  if (updates.length === 0) {
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
  redirect('/kalendarz');
}