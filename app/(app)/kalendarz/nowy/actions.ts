'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { dodajTreningSchema, parseFormData } from '@/lib/schemas';
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

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await enforceRateLimit(`user:${user.id}`, 'dodajTrening', 60, 3600);
  }

  const parsed = parseFormData(dodajTreningSchema, formData);
  const {
    data,
    godzina,
    miejsce,
    typ,
    przeciwnik,
    notatki,
    cykl,
    data_do: dataDo,
  } = parsed;

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

  const cyklId = cyklDostepny ? crypto.randomUUID() : null;

  const rows = dates.map((d) => ({
    data: d,
    godzina,
    miejsce,
    typ,
    przeciwnik,
    notatki,
    cykl_id: cyklId,
    druzyna_id: druzynaId,
  }));

  const { error } = await supabase.from('treningi').insert(rows);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  revalidatePath('/kalendarz/eksport');
  revalidatePath('/statystyki');
  redirect('/kalendarz?toast=trening_dodany');
}