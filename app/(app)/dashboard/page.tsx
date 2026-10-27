import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, getActiveDruzyna } from '@/lib/druzyny';
import { getDzisISO, getMonday, addDays, toISO } from '@/lib/dates';
import { DashboardClient } from './dashboardClient';
import { TopBar } from '@/components/TopBar';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { Zap } from 'lucide-react';

type TreningZObecnoscia = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
  obecnosc: { trening_id: number; status: string }[] | null;
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const params = await searchParams;
  const teraz = new Date();
  const dzisStr = getDzisISO();

  let poniedzialek = getMonday(teraz);
  if (params.w) {
    const parsed = new Date(params.w + 'T00:00:00');
    if (!isNaN(parsed.getTime())) poniedzialek = getMonday(parsed);
  }

  const niedziela = addDays(poniedzialek, 6);
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const activeDruzyna = await getActiveDruzyna();

  const odD = new Date(teraz.getFullYear(), teraz.getMonth() - 1, 1);
  const doD = new Date(teraz.getFullYear(), teraz.getMonth() + 2, 0);

  const [treningiRes] = await Promise.all([
    supabase
      .from('treningi')
      .select(`
        id, data, godzina, typ, przeciwnik, miejsce, notatki, cykl_id,
        obecnosc (trening_id, status)
      `)
      .eq('druzyna_id', druzynaId)
      .gte('data', toISO(odD))
      .lte('data', toISO(doD))
      .order('data', { ascending: true })
      .order('godzina', { ascending: true }),
  ]);

  const lista = (treningiRes.data ?? []) as unknown as TreningZObecnoscia[];
  const wszystkieObecnosci = lista.flatMap((t) => t.obecnosc ?? []);

  const stats: Record<string, { obecni: number; nieobecni: number }> = {};
  lista.forEach((t) => {
    let obecni = 0; let nieobecni = 0;
    for (const o of t.obecnosc ?? []) {
      if (o.status === 'obecny' || o.status === 'spozniony') obecni++;
      else nieobecni++;
    }
    stats[String(t.id)] = { obecni, nieobecni };
  });

  const dni = Array.from({ length: 7 }, (_, i) => toISO(addDays(poniedzialek, i)));

  const eventMap: Record<string, TreningZObecnoscia[]> = {};
  lista.forEach((t) => {
    if (!eventMap[t.data]) eventMap[t.data] = [];
    eventMap[t.data].push(t);
  });

  const jestWTygodniu = dzisStr >= toISO(poniedzialek) && dzisStr <= toISO(niedziela);

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      {/* NAGŁÓWEK PRZENIESIONY TUTAJ (na serwerze) */}
      <header className="mb-5 lg:mb-4 flex items-center gap-3 animate-fadeIn flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PageHeaderLogo icon={Zap} logoUrl={activeDruzyna?.logo_url ?? null} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-2xl font-bold leading-tight text-white drop-shadow-lg">Dzisiaj</h1>
            <p className="text-xs lg:text-sm text-white/70 font-medium mt-0.5 drop-shadow">Twój plan na najbliższe dni</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <TopBar />
        </div>
      </header>

      <DashboardClient
        initialDni={dni} poniedzialekISO={toISO(poniedzialek)} niedzielaISO={toISO(niedziela)}
        prevWeek={toISO(addDays(poniedzialek, -7))} nextWeek={toISO(addDays(poniedzialek, 7))}
        jestWTygodniu={jestWTygodniu} eventMap={eventMap} stats={stats}
        wszystkieObecnosci={wszystkieObecnosci}
      />
    </div>
  );
}