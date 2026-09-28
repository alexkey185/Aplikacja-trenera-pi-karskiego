import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { KalendarzClient } from './KalendarzClient';

export default async function KalendarzPage() {
  noStore();
  const supabase = await createClient();

  const { data: treningi } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, miejsce, notatki')
    .order('data', { ascending: true });

  const { data: obecnosci } = await supabase
    .from('obecnosc')
    .select('trening_id, status');

  // Grupujemy statystyki obecności po trening_id
  const statsMap = new Map<number, { obecni: number; nieobecni: number; total: number }>();
  (obecnosci ?? []).forEach((o) => {
    const s = statsMap.get(o.trening_id) ?? { obecni: 0, nieobecni: 0, total: 0 };
    s.total += 1;
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    else s.nieobecni += 1;
    statsMap.set(o.trening_id, s);
  });

  // Map nie przechodzi przez granicę server→client, konwertujemy na plain object
  const stats: Record<number, { obecni: number; nieobecni: number; total: number }> = {};
  statsMap.forEach((v, k) => {
    stats[k] = v;
  });

  return <KalendarzClient treningi={treningi ?? []} stats={stats} />;
}