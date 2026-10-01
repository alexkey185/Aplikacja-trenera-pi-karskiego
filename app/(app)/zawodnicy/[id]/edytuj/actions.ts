'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { dodajZawodnikaSchema, parseFormData } from '@/lib/schemas';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function aktualizujZawodnika(id: number, formData: FormData) {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  const parsed = parseFormData(dodajZawodnikaSchema, formData);
  const {
    imie,
    nazwisko,
    rocznik,
    pozycja,
    numer,
    kontakt_rodzica: kontakt,
    notatki,
  } = parsed;

  const { error } = await supabase
    .from('zawodnicy')
    .update({
      imie,
      nazwisko,
      rocznik,
      pozycja,
      numer,
      kontakt_rodzica: kontakt,
      notatki,
    })
    .eq('id', id)
    .eq('druzyna_id', druzynaId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kadra');
  revalidatePath(`/zawodnicy/${id}`);
  redirect(`/zawodnicy/${id}?toast=zawodnik_zapisany`);
}

export async function usunZawodnika(formData: FormData) {
  const idStr = formData.get('id') as string;
  const id = parseInt(idStr, 10);

  if (!id || isNaN(id)) {
    throw new Error('Nieprawidłowe ID zawodnika.');
  }

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  const supabase = await createClient();

  const { data: zawodnik, error: errFetch } = await supabase
    .from('zawodnicy')
    .select('id')
    .eq('id', id)
    .eq('druzyna_id', druzynaId)
    .single();

  if (errFetch || !zawodnik) {
    throw new Error('Nie znaleziono zawodnika w aktywnej drużynie.');
  }

  const { error: errObecnosc } = await supabase
    .from('obecnosc')
    .delete()
    .eq('zawodnik_id', id);

  if (errObecnosc) {
    console.error('Błąd usuwania obecności:', errObecnosc.message);
  }

  const { error, count } = await supabase
    .from('zawodnicy')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('druzyna_id', druzynaId);

  if (error) {
    throw new Error(`Nie udało się usunąć: ${error.message}`);
  }

  if (!count || count === 0) {
    throw new Error('Nie usunięto żadnego wiersza.');
  }

  revalidatePath('/kadra');
  revalidatePath('/kalendarz');
  revalidatePath('/statystyki');
  redirect('/kadra?toast=zawodnik_usuniety');
}