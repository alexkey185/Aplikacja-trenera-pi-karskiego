'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function aktualizujZawodnika(id: number, formData: FormData) {
  const supabase = await createClient();

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

  const { error } = await supabase
    .from('zawodnicy')
    .update({
      imie,
      nazwisko,
      rocznik: rocznikStr ? parseInt(rocznikStr, 10) : null,
      pozycja,
      numer: numerStr ? parseInt(numerStr, 10) : null,
      kontakt_rodzica: kontakt,
      notatki,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kadra');
  revalidatePath(`/zawodnicy/${id}`);
  redirect(`/zawodnicy/${id}`);
}

export async function usunZawodnika(formData: FormData) {
  const idStr = formData.get('id') as string;
  const id = parseInt(idStr, 10);

  if (!id || isNaN(id)) {
    throw new Error('Nieprawidłowe ID zawodnika.');
  }

  const supabase = await createClient();

  // Najpierw usuń powiązane obecności
  await supabase.from('obecnosc').delete().eq('zawodnik_id', id);

  // Potem usuń samego zawodnika
  const { error } = await supabase.from('zawodnicy').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kadra');
  redirect('/kadra');
}