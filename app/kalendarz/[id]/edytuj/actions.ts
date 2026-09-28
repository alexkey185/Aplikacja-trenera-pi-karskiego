'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ══════════════════════════════════════════════
// AKTUALIZACJA TRENINGU — single lub cała seria
// Zwraca { success: true } zamiast redirect() —
// dzięki temu klient sam decyduje o nawigacji
// i nie ma problemu z NEXT_REDIRECT w try/catch
// ══════════════════════════════════════════════
export async function aktualizujTrening(
  id: number,
  scope: 'single' | 'all',
  formData: FormData
): Promise<{ success: true; scope: 'single' | 'all' }> {
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

  // Pobierz obecny trening żeby znać cykl_id
  const { data: trening, error: errFetch } = await supabase
    .from('treningi')
    .select('id, cykl_id')
    .eq('id', id)
    .single();

  if (errFetch || !trening) {
    throw new Error('Nie znaleziono treningu.');
  }

  // ══════════════════════════════════════════════
  // Edycja pojedynczego wydarzenia
  // ══════════════════════════════════════════════
  if (scope === 'single' || !trening.cykl_id) {
    const { error } = await supabase
      .from('treningi')
      .update({ data, godzina, miejsce, typ, przeciwnik, notatki })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
  // ══════════════════════════════════════════════
  // Edycja całej serii cyklicznej
  // — aktualizujemy wszystkie treningi z tym samym cykl_id
  // — NIE zmieniamy daty (każdy ma swoją)
  // ══════════════════════════════════════════════
  else {
    const { error } = await supabase
      .from('treningi')
      .update({
        // data NIE jest zmieniana dla serii
        godzina,
        miejsce,
        typ,
        przeciwnik,
        notatki,
      })
      .eq('cykl_id', trening.cykl_id);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  revalidatePath('/kalendarz/eksport');

  return { success: true, scope: trening.cykl_id && scope === 'all' ? 'all' : 'single' };
}

// ══════════════════════════════════════════════
// USUWANIE — zostaje bez zmian (używa redirect z form action)
// ══════════════════════════════════════════════
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
  revalidatePath('/dashboard');
}