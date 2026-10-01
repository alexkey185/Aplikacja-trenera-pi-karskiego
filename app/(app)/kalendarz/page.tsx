import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { KalendarzClient } from './KalendarzClient';
import { TopBar } from '@/components/TopBar';
import { getActiveDruzynaId } from '@/lib/druzyny';

export default async function KalendarzPage() {
  noStore();
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const dzis = new Date();
  const od = new Date(dzis.getFullYear(), dzis.getMonth() - 2, 1);
  const do_ = new Date(dzis.getFullYear(), dzis.getMonth() + 3, 0);

  const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const { data: treningi } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, miejsce, notatki, cykl_id')
    .eq('druzyna_id', druzynaId)
    .gte('data', toISO(od))
    .lte('data', toISO(do_))
    .order('data', { ascending: true });

  const treningiIds = (treningi ?? []).map((t) => t.id);

  const { data: obecnosci } =
    treningiIds.length > 0
      ? await supabase
          .from('obecnosc')
          .select('trening_id, status')
          .in('trening_id', treningiIds)
      : { data: [] };

  const statsMap = new Map<number, { obecni: number; nieobecni: number; total: number }>();
  (obecnosci ?? []).forEach((o) => {
    const s = statsMap.get(o.trening_id) ?? { obecni: 0, nieobecni: 0, total: 0 };
    s.total += 1;
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    else s.nieobecni += 1;
    statsMap.set(o.trening_id, s);
  });

  const stats: Record<number, { obecni: number; nieobecni: number; total: number }> = {};
  statsMap.forEach((v, k) => {
    stats[k] = v;
  });

  return (
    <KalendarzClient
      treningi={treningi ?? []}
      stats={stats}
      topBar={<TopBar />}
    />
  );
}