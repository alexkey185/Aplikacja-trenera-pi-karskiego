'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ACTIVE_DRUZYNA_COOKIE } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { dodajDruzynaSchema, parseFormData } from '@/lib/schemas';

// ══════════════════════════════════════════════
// AKTUALIZACJA DRUŻYNY
// ══════════════════════════════════════════════
export async function aktualizujDruzyna(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Musisz być zalogowany.');
  }

  // Rate limit: max 20 edycji / godzinę
  await enforceRateLimit(`user:${user.id}`, 'aktualizujDruzyna', 20, 3600);

  // Walidacja Zod
  const parsed = parseFormData(dodajDruzynaSchema, formData);
  const { nazwa, rocznik, kolor } = parsed;

  const { error } = await supabase
    .from('druzyny')
    .update({
      nazwa,
      rocznik,
      kolor,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/druzyny');
  redirect('/druzyny');
}

// ══════════════════════════════════════════════
// USUWANIE DRUŻYNY
// ══════════════════════════════════════════════
export async function usunDruzyna(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('Brak ID drużyny.');
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Musisz być zalogowany.');
  }

  // Rate limit: max 5 usunięć / godzinę (żeby nie skasować całego konta przez pomyłkę)
  await enforceRateLimit(`user:${user.id}`, 'usunDruzyna', 5, 3600);

  // Sprawdź czy drużyna istnieje i należy do usera (RLS i tak to wymusi)
  const { data: druzyna, error: errFetch } = await supabase
    .from('druzyny')
    .select('id')
    .eq('id', id)
    .single();

  if (errFetch || !druzyna) {
    throw new Error('Nie znaleziono drużyny.');
  }

  // Usuń drużynę (kaskadowo usuwa zawodników, treningi i obecności)
  const { error } = await supabase.from('druzyny').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  // Jeśli usunięta drużyna była aktywna — ustaw inną
  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value;

  if (activeId === id) {
    const { data: pozostale } = await supabase
      .from('druzyny')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1);

    if (pozostale && pozostale.length > 0) {
      cookieStore.set(ACTIVE_DRUZYNA_COOKIE, pozostale[0].id, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        secure: process.env.NODE_ENV === 'production',
      });
    } else {
      cookieStore.delete(ACTIVE_DRUZYNA_COOKIE);
    }
  }

  revalidatePath('/', 'layout');
  revalidatePath('/druzyny');
  redirect('/druzyny');
}