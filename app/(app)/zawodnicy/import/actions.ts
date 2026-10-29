'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, ZAWODNICY_CACHE_TAG } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { parseImportText, rowsToInsert } from '@/lib/import-parser';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';

const MAX_ROWS = 200;
const MAX_TEXT_LENGTH = 100_000;

export async function importZawodnicy(formData: FormData) {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) throw new Error('Brak aktywnej druĹĽyny.');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await enforceRateLimit(`user:${user.id}`, 'importZawodnicy', 5, 3600);
  }

  const text = (formData.get('dane') as string) ?? '';
  if (!text.trim()) throw new Error('Wklej dane do zaimportowania.');
  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Za duĹĽo danych (max ${MAX_TEXT_LENGTH / 1024} KB).`);
  }

  const parsed = parseImportText(text);
  const rows = rowsToInsert(parsed);

  if (rows.length === 0) {
    throw new Error(
      parsed.errorCount > 0
        ? `Brak poprawnych wierszy (${parsed.errorCount} z bĹ‚Ä™dami).`
        : 'Nie znaleziono danych do importu.'
    );
  }
  if (rows.length > MAX_ROWS) {
    throw new Error(`Maksymalnie ${MAX_ROWS} zawodnikĂłw na raz.`);
  }

  const { data: istniejacy } = await supabase
    .from('zawodnicy')
    .select('imie, nazwisko')
    .eq('druzyna_id', druzynaId);

  const istniejaceKlucze = new Set(
    (istniejacy ?? []).map((z) =>
      `${(z.imie ?? '').toLowerCase().trim()}|${(z.nazwisko ?? '').toLowerCase().trim()}`
    )
  );

  const nowi = rows.filter((r) => {
    const key = `${r.imie.toLowerCase().trim()}|${r.nazwisko.toLowerCase().trim()}`;
    return !istniejaceKlucze.has(key);
  });

  const pominietych = rows.length - nowi.length;

  if (nowi.length === 0) {
    throw new Error(
      pominietych > 0
        ? `Wszyscy (${pominietych}) juĹĽ istniejÄ… w druĹĽynie.`
        : 'Brak nowych zawodnikĂłw.'
    );
  }

  const insertRows = nowi.map((r) => ({ ...r, druzyna_id: druzynaId }));

  const { error } = await supabase.from('zawodnicy').insert(insertRows);
  if (error) throw new Error(error.message);

  revalidateTag(ZAWODNICY_CACHE_TAG, 'default');
  revalidatePath('/kadra');

  const params = new URLSearchParams();
  params.set('toast', 'zawodnicy_zaimportowani');
  params.set('imported', String(nowi.length));
  if (pominietych > 0) params.set('skipped', String(pominietych));

  redirect(`/kadra?${params.toString()}`);
}