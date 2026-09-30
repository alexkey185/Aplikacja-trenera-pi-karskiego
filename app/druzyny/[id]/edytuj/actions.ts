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

export async function aktualizujDruzyna(id: string, formData: FormData) {
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

  const { error } = await supabase
    .from('druzyny')
    .update({
      nazwa,
      rocznik: rocznikStr ? parseInt(rocznikStr, 10) : null,
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

export async function usunDruzyna(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('Brak ID drużyny.');
  }

  const supabase = await createClient();

  const { data: druzyna, error: errFetch } = await supabase
    .from('druzyny')
    .select('id')
    .eq('id', id)
    .single();

  if (errFetch || !druzyna) {
    throw new Error('Nie znaleziono drużyny.');
  }

  const { error } = await supabase.from('druzyny').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

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