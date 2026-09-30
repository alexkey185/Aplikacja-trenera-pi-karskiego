'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function dodajZawodnika(formData: FormData) {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny. Utwórz najpierw drużynę.');
  }

  const imie = (formData.get('imie') as string)?.trim();
  const nazwisko = (formData.get('nazwisko') as string)?.trim();
  const rocznikStr = (formData.get('rocznik') as string)?.trim();
  const pozycja = (formData.get('pozycja') as string)?.trim() || null;
  const numerStr = (formData.get('numer') as string)?.trim();
  const kontakt = (formData.get('kontakt_rodzica') as string)?.trim() || null;
  const notatki = (formData.get('notatki') as string)?.trim() || null;

  if (!imie || !nazwisko) {
    throw new Error('Imię i nazwisko są wymagane.');
  }

  const { error } = await supabase.from('zawodnicy').insert({
    imie,
    nazwisko,
    rocznik: rocznikStr ? parseInt(rocznikStr, 10) : null,
    pozycja,
    numer: numerStr ? parseInt(numerStr, 10) : null,
    kontakt_rodzica: kontakt,
    notatki,
    druzyna_id: druzynaId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kadra');
  redirect('/kadra');
}