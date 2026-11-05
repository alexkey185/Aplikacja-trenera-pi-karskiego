'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { revalidatePath } from 'next/cache';

export async function zapiszWynikMeczu(
  id: number,
  wynikGospodarzy: number | null,
  wynikGosci: number | null
) {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  
  if (!druzynaId) return { error: 'Brak aktywnej drużyny.' };

  // Walidacja: jeśli jeden jest wpisany, drugi też musi być (lub oba null)
  const gosp = isNaN(Number(wynikGospodarzy)) ? null : wynikGospodarzy;
  const gosc = isNaN(Number(wynikGosci)) ? null : wynikGosci;

  const { error } = await supabase
    .from('treningi')
    .update({ 
      wynik_gospodarzy: gosp,
      wynik_gosci: gosc
    })
    .eq('id', id)
    .eq('druzyna_id', druzynaId);

  if (error) {
    return { error: 'Nie udało się zapisać wyniku.' };
  }

  revalidatePath('/sezon');
  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  
  return { success: true };
}