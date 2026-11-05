import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ACTIVE_DRUZYNA_COOKIE } from './constants'; // <-- Import z nowego pliku

export type Rola = 'admin' | 'trener' | 'rodzic';

export type Druzyna = {
  id: string; nazwa: string; rocznik: number | null; kolor: string; created_at: string; logo_url: string | null; rola: Rola;
};

export const getDruzyny = cache(async (): Promise<Druzyna[]> => {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession(); // Szybsze getSession
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('druzyna_czlonkowie')
      .select(`rola, druzyny (id, nazwa, rocznik, kolor, created_at, logo_url)`)
      .eq('user_id', session.user.id);

    if (error || !data) {
      const { data: stareDruzyny } = await supabase
        .from('druzyny')
        .select('id, nazwa, rocznik, kolor, created_at, logo_url')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });
      return (stareDruzyny ?? []).map((d) => ({ ...d, rola: 'admin' as Rola }));
    }

    return data.map((item: any) => item.druzyny ? { ...item.druzyny, rola: item.rola as Rola } : null).filter((d): d is Druzyna => d !== null);
  } catch {
    return [];
  }
});

export const getActiveDruzynaId = cache(async (): Promise<string | null> => {
  const druzyny = await getDruzyny();
  if (druzyny.length === 0) return null;

  const cookieStore = await cookies();
  const active = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value;

  if (active && druzyny.some((d) => d.id === active)) return active;
  return druzyny[0].id;
});

export const getActiveDruzyna = cache(async (): Promise<Druzyna | null> => {
  const id = await getActiveDruzynaId();
  if (!id) return null;
  const druzyny = await getDruzyny();
  return druzyny.find((d) => d.id === id) ?? null;
});

export const getZawodnicyCounts = cache(async (): Promise<Record<string, number>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_zawodnicy_counts');
    if (error || !data) return {};

    const counts: Record<string, number> = {};
    data.forEach((row: any) => {
      counts[row.druzyna_id] = Number(row.count);
    });
    return counts;
  } catch {
    return {};
  }
});