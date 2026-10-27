'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

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
  if (!Number.isInteger(treningId) || treningId <= 0) {
    return { error: 'Nieprawidłowe ID treningu.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Musisz być zalogowany.' };
  }

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

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    return { error: 'Brak aktywnej drużyny.' };
  }

  const raw = {
    notatki: formData.get('notatki') ?? '',
  };

  const parsed = notatkaSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error, count } = await supabase
    .from('treningi')
    .update({ notatki: parsed.data.notatki }, { count: 'exact' })
    .eq('id', treningId)
    .eq('druzyna_id', druzynaId)
    .select('id');

  if (error) {
    console.error('Błąd zapisu notatki:', error);
    return { error: 'Nie udało się zapisać notatki. Spróbuj ponownie.' };
  }

  if (!count || count === 0) {
    return { error: 'Nie znaleziono treningu w aktywnej drużynie.' };
  }

  return { success: true };
}