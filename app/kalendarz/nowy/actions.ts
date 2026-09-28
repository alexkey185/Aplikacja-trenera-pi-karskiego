'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export async function dodajTrening(formData: FormData) {
  const supabase = await createClient();

  const data = (formData.get('data') as string)?.trim();
  const godzina = (formData.get('godzina') as string)?.trim();
  const miejsce = (formData.get('miejsce') as string)?.trim() || null;
  const typ = (formData.get('typ') as string)?.trim() || 'trening';
  const przeciwnik = (formData.get('przeciwnik') as string)?.trim() || null;
  const notatki = (formData.get('notatki') as string)?.trim() || null;
  const cykl = (formData.get('cykl') as string)?.trim() || 'nie_powtarzaj';
  const dataDo = (formData.get('data_do') as string)?.trim();

  if (!data || !godzina) {
    throw new Error('Data i godzina są wymagane.');
  }

  // Cykliczność tylko dla treningu
  const cyklDostepny = typ === 'trening' && cykl !== 'nie_powtarzaj';

  const dates: string[] = [];

  if (!cyklDostepny) {
    dates.push(data);
  } else {
    if (!dataDo) {
      throw new Error('Wybierz datę końcową.');
    }

    const startDate = new Date(data + 'T00:00:00');
    const endDate = new Date(dataDo + 'T00:00:00');

    if (endDate < startDate) {
      throw new Error('Data końcowa musi być po dacie startu.');
    }

    const stepDays = cykl === 'co_2_tygodnie' ? 14 : 7;
    const diffDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const liczba = Math.floor(diffDays / stepDays) + 1;

    if (liczba < 2) {
      throw new Error('Data końcowa daje tylko 1 wystąpienie.');
    }
    if (liczba > 52) {
      throw new Error('Maksymalna liczba wystąpień to 52 (rok).');
    }

    for (let i = 0; i < liczba; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * stepDays);
      dates.push(toISODate(d));
    }
  }

  const rows = dates.map((d) => ({
    data: d,
    godzina,
    miejsce,
    typ,
    przeciwnik,
    notatki,
  }));

  const { error } = await supabase.from('treningi').insert(rows);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  redirect('/kalendarz');
}