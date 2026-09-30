'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ACTIVE_DRUZYNA_COOKIE } from '@/lib/druzyny';

const DOZWOLONE_KOLORY = [
  'green',
  'blue',
  'purple',
  'orange',
  'red',
  'yellow',
  'pink',
  'slate',
];

export async function dodajDruzyna(formData: FormData) {
  const supabase = await createClient();

  const nazwa = (formData.get('nazwa') as string)?.trim();
  const rocznikStr = (formData.get('rocznik') as string)?.trim();
  const kolor = (formData.get('kolor') as string)?.trim() || 'green';

  if (!nazwa) {
    throw new Error('Nazwa drużyny jest wymagana.');
  }

  if (nazwa.length > 80) {
    throw new Error('Nazwa nie może być dłuższa niż 80 znaków.');
  }

  if (!DOZWOLONE_KOLORY.includes(kolor)) {
    throw new Error('Nieprawidłowy kolor.');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Musisz być zalogowany.');
  }

  const { data: nowa, error } = await supabase
    .from('druzyny')
    .insert({
      user_id: user.id,
      nazwa,
      rocznik: rocznikStr ? parseInt(rocznikStr, 10) : null,
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