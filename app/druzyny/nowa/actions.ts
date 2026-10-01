'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ACTIVE_DRUZYNA_COOKIE } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { dodajDruzynaSchema, parseFormData } from '@/lib/schemas';

export async function dodajDruzyna(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Musisz być zalogowany.');
  }

  // Rate limit: max 10 nowych drużyn / godzinę
  await enforceRateLimit(`user:${user.id}`, 'dodajDruzyna', 10, 3600);

  // Walidacja Zod
  const parsed = parseFormData(dodajDruzynaSchema, formData);
  const { nazwa, rocznik, kolor } = parsed;

  const { data: nowa, error } = await supabase
    .from('druzyny')
    .insert({
      user_id: user.id,
      nazwa,
      rocznik,
      kolor,
    })
    .select('id')
    .single();

  if (error || !nowa) {
    throw new Error(error?.message ?? 'Nie udało się utworzyć drużyny.');
  }

  // Ustaw nową drużynę jako aktywną
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_DRUZYNA_COOKIE, nowa.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  });

  revalidatePath('/', 'layout');
  redirect('/druzyny');
}