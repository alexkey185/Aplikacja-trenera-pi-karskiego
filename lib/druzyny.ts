import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ACTIVE_DRUZYNA_COOKIE } from '@/lib/constants';

export type Druzyna = {
  id: string;
  nazwa: string;
  rocznik: number | null;
  kolor: string;
  logo_url: string | null;
  rola: 'admin' | 'trener' | 'viewer';
};

// NOWA FUNKCJA: Szybkie cookie (bez round-tripu do bazy)
export const getActiveDruzynaIdFast = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value ?? null;
  if (fromCookie) return fromCookie;
  return getActiveDruzynaId();
});

export const getActiveDruzynaId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const cookieId = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value ?? null;

  const { data } = await supabase
    .from('druzyny')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (cookieId) {
    const { data: cookieDruzyna } = await supabase
      .from('druzyny')
      .select('id')
      .eq('id', cookieId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (cookieDruzyna) return cookieDruzyna.id;
  }

  return data?.id ?? null;
});

export const getActiveDruzyna = cache(async (): Promise<Druzyna | null> => {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaIdFast();
  if (!druzynaId) return null;

  const { data } = await supabase
    .from('druzyny')
    .select('id, nazwa, rocznik, kolor, logo_url')
    .eq('id', druzynaId)
    .maybeSingle();

  if (!data) return null;

  return {
    ...data,
    rola: 'admin',
  };
});

export const getDruzyny = cache(async (): Promise<Druzyna[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('druzyny')
    .select('id, nazwa, rocznik, kolor, logo_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!data) return [];

  return data.map((d) => ({
    ...d,
    rola: 'admin',
  }));
});

export const getZawodnicyCounts = cache(async (): Promise<Record<string, number>> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const druzyny = await getDruzyny();
  if (druzyny.length === 0) return {};

  const ids = druzyny.map(d => d.id);
  
  const { data: zawodnicy } = await supabase
    .from('zawodnicy')
    .select('druzyna_id')
    .in('druzyna_id', ids);

  const counts: Record<string, number> = {};
  (zawodnicy ?? []).forEach(z => {
    if (z.druzyna_id) {
      counts[z.druzyna_id] = (counts[z.druzyna_id] ?? 0) + 1;
    }
  });

  return counts;
});