'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  ACTIVE_DRUZYNA_COOKIE,
  DRUZYNY_CACHE_TAG,
  ZAWODNICY_CACHE_TAG,
} from '@/lib/druzyny';
import { dodajDruzynaSchema, parseFormData } from '@/lib/schemas';
import { z } from 'zod';
import { requireRole } from '@/lib/auth-utils';

const uuidSchema = z.string().uuid();

export async function aktualizujDruzyna(id: string, formData: FormData) {
  // OCHRONA: Tylko admin może edytować drużynę
  await requireRole(['admin']);

  if (!uuidSchema.safeParse(id).success) {
    throw new Error('Nieprawidłowe ID drużyny.');
  }

  const supabase = await createClient();
  const parsed = parseFormData(dodajDruzynaSchema, formData);
  const { nazwa, rocznik, kolor } = parsed;

  const { error } = await supabase
    .from('druzyny')
    .update({ nazwa, rocznik, kolor })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag(DRUZYNY_CACHE_TAG, 'default');
  revalidatePath('/', 'layout');
  revalidatePath('/druzyny');
  redirect('/druzyny?toast=druzyna_zapisana');
}

export async function usunDruzyna(formData: FormData) {
  // OCHRONA: Tylko admin może usunąć drużynę
  const druzyna = await requireRole(['admin']);

  const id = formData.get('id') as string;
  if (!id || !uuidSchema.safeParse(id).success) {
    throw new Error('Nieprawidłowe ID drużyny.');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('druzyny')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value;
  if (activeId === id) cookieStore.delete(ACTIVE_DRUZYNA_COOKIE);

  revalidateTag(DRUZYNY_CACHE_TAG, 'default');
  revalidateTag(ZAWODNICY_CACHE_TAG, 'default');
  revalidatePath('/', 'layout');
  redirect('/druzyny?toast=druzyna_usunieta');
}