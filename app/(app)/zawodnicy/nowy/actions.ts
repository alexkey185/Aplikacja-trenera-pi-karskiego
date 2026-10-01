'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { dodajZawodnikaSchema, parseFormData } from '@/lib/schemas';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function dodajZawodnika(formData: FormData) {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny. Utwórz najpierw drużynę.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await enforceRateLimit(`user:${user.id}`, 'dodajZawodnika', 30, 3600);
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

  const { error } = await supabase.from('zawodnicy').insert({
    imie,
    nazwisko,
    rocznik,
    pozycja,
    numer,
    kontakt_rodzica: kontakt,
    notatki,
    druzyna_id: druzynaId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kadra');
  redirect('/kadra?toast=zawodnik_dodany');
}