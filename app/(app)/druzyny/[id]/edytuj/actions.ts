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
}'use server';

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
  const druzyna = await requireRole(['admin']);

  if (!uuidSchema.safeParse(id).success) {
    throw new Error('Nieprawidłowe ID drużyny.');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ↓↓↓ KLUCZOWA ZMIANA: weryfikacja właścicielstwa ↓↓↓
  const { data: target, error: e } = await supabase
    .from('druzyny').select('user_id').eq('id', id).single();
  if (e || !target || target.user_id !== user!.id) {
    throw new Error('Nie masz uprawnień do edycji tej drużyny.');
  }

  const parsed = parseFormData(dodajDruzynaSchema, formData);
  const { nazwa, rocznik, kolor } = parsed;

  // ↓↓↓ KLUCZOWA ZMIANA: filtr user_id jako defense-in-depth ↓↓↓
  const { error } = await supabase
    .from('druzyny')
    .update({ nazwa, rocznik, kolor })
    .eq('id', id)
    .eq('user_id', user!.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag(DRUZYNY_CACHE_TAG, 'default');
  revalidatePath('/', 'layout');
  revalidatePath('/druzyny');
  redirect('/druzyny?toast=druzyna_zapisana');
}

export async function usunDruzyna(formData: FormData) {
  const druzyna = await requireRole(['admin']);

  const id = formData.get('id') as string;
  if (!id || !uuidSchema.safeParse(id).success) {
    throw new Error('Nieprawidłowe ID drużyny.');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ↓↓↓ KLUCZOWA ZMIANA: filtr user_id zapobiega IDOR ↓↓↓
  const { error, count } = await supabase
    .from('druzyny')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user!.id);

  if (error) throw new Error(error.message);
  if (!count || count === 0) {
    throw new Error('Nie znaleziono drużyny lub brak uprawnień.');
  }

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value;
  if (activeId === id) cookieStore.delete(ACTIVE_DRUZYNA_COOKIE);

  // Audit log
  await supabase.rpc('log_audit', {
    p_action: 'delete_druzyna',
    p_entity_type: 'druzyna',
    p_entity_id: id,
  });

  revalidateTag(DRUZYNY_CACHE_TAG, 'default');
  revalidateTag(ZAWODNICY_CACHE_TAG, 'default');
  revalidatePath('/', 'layout');
  redirect('/druzyny?toast=druzyna_usunieta');
}