import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KalendarzClient } from './KalendarzClient';
import { TopBar } from '@/components/TopBar';
import { getActiveDruzynaId, getActiveDruzyna } from '@/lib/druzyny';
import { toISO } from '@/lib/dates';

type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
};

type TreningZObecnoscia = Trening & {
  obecnosc: { trening_id: number; status: string }[] | null;
};

type StatsMap = Record<
  number,
  { obecni: number; nieobecni: number; total: number }
>;

export default async function KalendarzPage() {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const activeDruzyna = await getActiveDruzyna();

  const dzis = new Date();
  const od = new Date(dzis.getFullYear(), dzis.getMonth() - 2, 1);
  const do_ = new Date(dzis.getFullYear(), dzis.getMonth() + 3, 0);

  const { data: rawTreningi } = await supabase
    .from('treningi')
    .select(`
      id, data, godzina, typ, przeciwnik, miejsce, notatki, cykl_id,
      obecnosc (trening_id, status)
    `)
    .eq('druzyna_id', druzynaId)
    .gte('data', toISO(od))
    .lte('data', toISO(do_))
    .order('data', { ascending: true });

  const lista = (rawTreningi ?? []) as TreningZObecnoscia[];

  const stats: StatsMap = {};
  lista.forEach((t) => {
    let obecni = 0;
    let nieobecni = 0;
    for (const o of t.obecnosc ?? []) {
      if (o.status === 'obecny' || o.status === 'spozniony') obecni++;
      else nieobecni++;
    }
    stats[t.id] = { obecni, nieobecni, total: obecni + nieobecni };
  });

  const treningi: Trening[] = lista.map((t) => ({
    id: t.id,
    data: t.data,
    godzina: t.godzina,
    typ: t.typ,
    przeciwnik: t.przeciwnik,
    miejsce: t.miejsce,
    notatki: t.notatki,
    cykl_id: t.cykl_id,
  }));

  return (
    <KalendarzClient
      treningi={treningi}
      stats={stats}
      topBar={<TopBar />}
      logoUrl={activeDruzyna?.logo_url ?? null}
    />
  );
}