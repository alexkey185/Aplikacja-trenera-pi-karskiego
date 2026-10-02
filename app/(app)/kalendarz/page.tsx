import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { KalendarzClient } from './KalendarzClient';
import { TopBar } from '@/components/TopBar';
import { getActiveDruzynaId } from '@/lib/druzyny';

// Typy zgodne z KalendarzClient
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
  noStore();
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const dzis = new Date();
  const od = new Date(dzis.getFullYear(), dzis.getMonth() - 2, 1);
  const do_ = new Date(dzis.getFullYear(), dzis.getMonth() + 3, 0);

  const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // ═══════════════════════════════════════════════════════════
  // JEDNO zapytanie — treningi z zagnieżdżoną obecnością.
  //
  // Było: 2 zapytania (treningi, potem osobno obecnosc .in(ids))
  // Jest: 1 zapytanie (PostgREST robi LEFT JOIN, RLS per tabela)
  // ═══════════════════════════════════════════════════════════
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

  // Statystyki per trening — spłaszczamy obecności z zagnieżdżonej tablicy
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

  // Strip `obecnosc` — KalendarzClient nie zna tego pola, przekazujemy
  // tylko potrzebne kolumny (explicytnie, żeby nie śmiecić propsów)
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
    />
  );
}