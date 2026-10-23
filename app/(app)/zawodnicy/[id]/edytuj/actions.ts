'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, ZAWODNICY_CACHE_TAG } from '@/lib/druzyny';
import { dodajZawodnikaSchema, parseFormData } from '@/lib/schemas';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

export async function aktualizujZawodnika(
  id: number,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    return { error: 'Brak aktywnej druzyny.' };
  }

  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') raw[key] = value;
  }

  const result = dodajZawodnikaSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const key = String(issue.path[0]);
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const { imie, nazwisko, rocznik, pozycja, numer, kontakt_rodzica, notatki } = result.data;

  const { error } = await supabase
    .from('zawodnicy')
    .update({
      imie,
      nazwisko,
      rocznik: rocznik ?? null,
      pozycja: pozycja ?? null,
      numer: numer ?? null,
      kontakt_rodzica: kontakt_rodzica ?? null,
      notatki: notatki ?? null,
    })
    .eq('id', id)
    .eq('druzyna_id', druzynaId);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(ZAWODNICY_CACHE_TAG, 'default');
  revalidatePath('/kadra');
  revalidatePath(`/zawodnicy/${id}`);
  redirect(`/zawodnicy/${id}?toast=zawodnik_zapisany`);
}

export async function usunZawodnika(formData: FormData) {
  const idStr = formData.get('id') as string;
  const id = parseInt(idStr, 10);

  if (!id || isNaN(id)) {
    throw new Error('Nieprawidlowe ID zawodnika.');
  }

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej druzyny.');
  }

  const supabase = await createClient();

  const { data: zawodnik, error: errFetch } = await supabase
    .from('zawodnicy')
    .select('id')
    .eq('id', id)
    .eq('druzyna_id', druzynaId)
    .single();

  if (errFetch || !zawodnik) {
    throw new Error('Nie znaleziono zawodnika w aktywnej druzynie.');
  }

  const { error, count } = await supabase
    .from('zawodnicy')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('druzyna_id', druzynaId);

  if (error) {
    throw new Error(`Nie udalo sie usunac: ${error.message}`);
  }

  if (!count || count === 0) {
    throw new Error('Nie usunieto zadnego wiersza.');
  }

  revalidateTag(ZAWODNICY_CACHE_TAG, 'default');
  revalidatePath('/kadra');
  revalidatePath('/kalendarz');
  revalidatePath('/statystyki');
  redirect('/kadra?toast=zawodnik_usuniety');
}