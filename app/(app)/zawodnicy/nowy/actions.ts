'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, ZAWODNICY_CACHE_TAG } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { dodajZawodnikaSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/errors';
import { isDemoMode } from '@/lib/demo';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { FormState } from '@/lib/action-result';

export async function dodajZawodnika(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (await isDemoMode()) {
    return { error: 'W wersji demo nie zapisujemy zmian. Załóż konto, aby korzystać z aplikacji.' };
  }

  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    return { error: 'Brak aktywnej drużyny.' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      await enforceRateLimit(`user:${user.id}`, 'dodajZawodnika', 30, 3600);
    } catch (err) {
      return { error: getErrorMessage(err) };
    }
  }

  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') raw[key] = value;
  }

  const result = dodajZawodnikaSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const key = String(issue.path[0]);
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    });
    return { fieldErrors };
  }

  const { imie, nazwisko, rocznik, pozycja, numer, kontakt_rodzica, notatki } = result.data;

  const { error } = await supabase.from('zawodnicy').insert({
    imie,
    nazwisko,
    rocznik: rocznik ?? null,
    pozycja: pozycja ?? null,
    numer: numer ?? null,
    kontakt_rodzica: kontakt_rodzica ?? null,
    notatki: notatki ?? null,
    druzyna_id: druzynaId,
  });

  if (error) {
    return { error: getErrorMessage(error) };
  }

  revalidateTag(ZAWODNICY_CACHE_TAG, 'default');
  revalidatePath('/kadra');
  redirect('/kadra?toast=zawodnik_dodany');
}