'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { dodajTreningSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/errors';
import { revalidateKalendarz } from '@/lib/action-result';
import { redirect } from 'next/navigation';

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function dodajTrening(formData: FormData) {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) throw new Error('Brak aktywnej drużyny.');

  const { data: { user } } = await supabase.auth.getUser();
  if (user) await enforceRateLimit(`user:${user.id}`, 'dodajTrening', 60, 3600);

  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') raw[key] = value;
  }

  const parsed = dodajTreningSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { data, godzina, miejsce, typ, przeciwnik, notatki, cykl, data_do: dataDo } = parsed.data;

  const cyklDostepny = typ === 'trening' && cykl !== 'nie_powtarzaj';
  const dates: string[] = [];

  if (!cyklDostepny) {
    dates.push(data);
  } else {
    if (!dataDo) throw new Error('Wybierz datę końcową.');
    const startDate = new Date(data + 'T00:00:00');
    const endDate = new Date(dataDo + 'T00:00:00');

    if (endDate < startDate) throw new Error('Data końcowa musi być po dacie startu.');

    const stepDays = cykl === 'co_2_tygodnie' ? 14 : 7;
    const liczba = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) / stepDays) + 1;

    if (liczba < 2) throw new Error('Data końcowa daje tylko 1 wystąpienie.');
    if (liczba > 52) throw new Error('Maksymalna liczba wystąpień to 52 (rok).');

    for (let i = 0; i < liczba; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * stepDays);
      dates.push(toISODate(d));
    }
  }

  const cyklId = cyklDostepny ? crypto.randomUUID() : null;
  const rows = dates.map((d) => ({ data: d, godzina, miejsce, typ, przeciwnik, notatki, cykl_id: cyklId, druzyna_id: druzynaId }));

  const { error } = await supabase.from('treningi').insert(rows);
  if (error) throw new Error(getErrorMessage(error));

  revalidateKalendarz();
  redirect('/kalendarz?toast=trening_dodany');
}