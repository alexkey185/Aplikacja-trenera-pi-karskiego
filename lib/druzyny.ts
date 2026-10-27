import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const ACTIVE_DRUZYNA_COOKIE = 'active_druzyna_id';

export type Rola = 'admin' | 'trener' | 'rodzic';

export type Druzyna = {
  id: string;
  nazwa: string;
  rocznik: number | null;
  kolor: string;
  created_at: string;
  logo_url: string | null;
  rola: Rola;
};

export const DRUZYNY_CACHE_TAG = 'druzyny';
export const ZAWODNICY_CACHE_TAG = 'zawodnicy-counts';

export const getDruzyny = cache(async (): Promise<Druzyna[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('druzyna_czlonkowie')
    .select(`
      rola,
      druzyny (id, nazwa, rocznik, kolor, created_at, logo_url)
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Błąd pobierania drużyn (sprawdź RLS i tabele):', error);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => {
    if (!item.druzyny) return null;
    return {
      ...item.druzyny,
      rola: item.rola as Rola,
    };
  }).filter((d): d is Druzyna => d !== null);
});

export const getActiveDruzynaId = cache(async (): Promise<string | null> => {
  const druzyny = await getDruzyny();
  if (druzyny.length === 0) return null;

  const cookieStore = await cookies();
  const active = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value;

  if (active && druzyny.some((d) => d.id === active)) {
    return active;
  }

  return druzyny[0].id;
});

export const getActiveDruzyna = cache(async (): Promise<Druzyna | null> => {
  const id = await getActiveDruzynaId();
  if (!id) return null;
  const druzyny = await getDruzyny();
  return druzyny.find((d) => d.id === id) ?? null;
});

export const getZawodnicyCounts = cache(
  async (): Promise<Record<string, number>> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const druzyny = await getDruzyny();
    if (druzyny.length === 0) return {};
    const druzynaIds = druzyny.map((d) => d.id);

    const { data: zawodnicy, error } = await supabase
      .from('zawodnicy')
      .select('druzyna_id')
      .in('druzyna_id', druzynaIds);

    if (error) return {};

    const counts: Record<string, number> = {};
    (zawodnicy ?? []).forEach((z) => {
      if (z.druzyna_id) {
        counts[z.druzyna_id] = (counts[z.druzyna_id] ?? 0) + 1;
      }
    });
    return counts;
  }
);