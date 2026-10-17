'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { revalidatePath } from 'next/cache';

export async function zapiszWynikLubNotatke(treningId: number, formData: FormData) {
  if (!Number.isInteger(treningId) || treningId <= 0) {
    throw new Error('Nieprawidłowe ID treningu.');
  }

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  const notatki = formData.get('notatki') as string;

  const { error } = await supabase
    .from('treningi')
    .update({ notatki: notatki.trim() || null })
    .eq('id', treningId)
    .eq('druzyna_id', druzynaId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
}