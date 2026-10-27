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
  rola: Rola; // <-- Nowe pole
};

export const DRUZYNY_CACHE_TAG = 'druzyny';
export const ZAWODNICY_CACHE_TAG = 'zawodnicy-counts';

export const getDruzyny = cache(async (): Promise<Druzyna[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Pobieramy drużyny przez tabelę łączącą
  const { data } = await supabase
    .from('druzyna_czlonkowie')
    .select(`
      rola,
      druzyny (id, nazwa, rocznik, kolor, created_at, logo_url)
    `)
    .eq('user_id', user.id);

  if (!data) return [];

  // Mapujemy wynik z bazy na nasz płaski obiekt
  return data.map((item: any) => ({
    ...item.druzyny,
    rola: item.rola as Rola,
  })).filter(d => d.id);
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