'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function aktualizujTrening(id: number, formData: FormData) {
  const supabase = await createClient();

  const data = (formData.get('data') as string)?.trim();
  const godzina = (formData.get('godzina') as string)?.trim();
  const miejsce = (formData.get('miejsce') as string)?.trim() || null;
  const typ = (formData.get('typ') as string)?.trim() || 'trening';
  const przeciwnik = (formData.get('przeciwnik') as string)?.trim() || null;
  const notatki = (formData.get('notatki') as string)?.trim() || null;

  if (!data || !godzina) {
    throw new Error('Data i godzina są wymagane.');
  }

  const { error } = await supabase
    .from('treningi')
    .update({ data, godzina, miejsce, typ, przeciwnik, notatki })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kalendarz');
  redirect('/kalendarz');
}

export async function usunTrening(formData: FormData) {
  const idStr = formData.get('id') as string;
  const id = parseInt(idStr, 10);

  if (!id || isNaN(id)) {
    throw new Error('Nieprawidłowe ID.');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('treningi').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kalendarz');
  redirect('/kalendarz');
}