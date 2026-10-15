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
    throw new Error('Brak aktywnej druzyny.');
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

  // ═══════════════════════════════════════════════════════════════
  // Poprawka: NIE kasujemy obecnosci ręcznie - kaskada FK
  // (migracja 20261015_fk_cascade.sql) robi to atomowo w bazie.
  // Ręczne kasowanie było źródłem race conditions i dwóch requestów.
  // ═══════════════════════════════════════════════════════════════
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

  revalidatePath('/kadra');
  revalidatePath('/kalendarz');
  revalidatePath('/statystyki');
  redirect('/kadra?toast=zawodnik_usuniety');
}