'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ACTIVE_DRUZYNA_COOKIE } from './druzyny';

export async function setActiveDruzyna(id: string) {
  // Weryfikacja przez RLS — user widzi tylko swoje drużyny
  const supabase = await createClient();
  const { data } = await supabase
    .from('druzyny')
    .select('id')
    .eq('id', id)
    .single();

  if (!data) {
    return { error: 'Nie znaleziono drużyny.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_DRUZYNA_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  });

  revalidatePath('/', 'layout');

  return { success: true };
}