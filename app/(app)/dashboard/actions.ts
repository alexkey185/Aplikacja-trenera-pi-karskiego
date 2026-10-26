'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// P1.4: Walidacja Zod - notatki max 2000 znaków, trim, pusty → null
const notatkaSchema = z.object({
  notatki: z
    .string()
    .trim()
    .max(2000, 'Notatka może mieć maksymalnie 2000 znaków')
    .transform((v) => (v === '' ? null : v)),
});

export type FormState = {
  error?: string;
  success?: boolean;
} | null;

export async function zapiszWynikLubNotatke(
  treningId: number,
  formData: FormData
): Promise<FormState> {
  // P1.4: Walidacja ID treningu (integer > 0)
  if (!Number.isInteger(treningId) || treningId <= 0) {
    return { error: 'Nieprawidłowe ID treningu.' };
  }

  const supabase = await createClient();

  // P1.4: Sprawdzenie sesji
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Musisz być zalogowany.' };
  }

  // P1.4: Rate limit - 100 zapisów na godzinę per user
  try {
    await enforceRateLimit(
      `user:${user.id}`,
      'zapiszWynikLubNotatke',
      100,
      3600
    );
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Zbyt wiele operacji.',
    };
  }

  // P1.4: Aktywna drużyna
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    return { error: 'Brak aktywnej drużyny.' };
  }

  // P1.4: Walidacja notatki przez Zod
  const raw = {
    notatki: formData.get('notatki') ?? '',
  };

  const parsed = notatkaSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // P1.4: UPDATE z pełnym filtrem (id + druzyna_id) - defense in depth obok RLS
  const { error, count } = await supabase
    .from('treningi')
    .update({ notatki: parsed.data.notatki })
    .eq('id', treningId)
    .eq('druzyna_id', druzynaId)
    .select('id', { count: 'exact' });

  if (error) {
    console.error('Błąd zapisu notatki:', error);
    return { error: 'Nie udało się zapisać notatki. Spróbuj ponownie.' };
  }

  // P1.4: Brak wiersza = trening nie istnieje LUB należy do innej drużyny
  if (!count || count === 0) {
    return { error: 'Nie znaleziono treningu w aktywnej drużynie.' };
  }

  return { success: true };
}