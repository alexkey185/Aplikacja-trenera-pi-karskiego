import 'server-only';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const ACTIVE_DRUZYNA_COOKIE = 'active_druzyna_id';

export type Druzyna = {
  id: string;
  nazwa: string;
  rocznik: number | null;
  kolor: string;
  created_at: string;
};

export async function getDruzyny(): Promise<Druzyna[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('druzyny')
    .select('id, nazwa, rocznik, kolor, created_at')
    .order('created_at', { ascending: true });
  return (data ?? []) as Druzyna[];
}

export async function getActiveDruzynaId(): Promise<string | null> {
  const druzyny = await getDruzyny();
  if (druzyny.length === 0) return null;

  const cookieStore = await cookies();
  const active = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value;

  if (active && druzyny.some((d) => d.id === active)) {
    return active;
  }

  return druzyny[0].id;
}

export async function getActiveDruzyna(): Promise<Druzyna | null> {
  const id = await getActiveDruzynaId();
  if (!id) return null;
  const druzyny = await getDruzyny();
  return druzyny.find((d) => d.id === id) ?? null;
}