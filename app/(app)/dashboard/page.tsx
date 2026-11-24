import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaIdFast, getActiveDruzyna } from '@/lib/druzyny';
import { getDzisISO, getMonday, addDays, toISO } from '@/lib/dates';
import { DashboardClient } from './dashboardClient';
import { TopBar } from '@/components/TopBar';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { Zap } from 'lucide-react';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const params = await searchParams;
  const teraz = new Date();
  const dzisStr = getDzisISO();

  let poniedzialek = getMonday(teraz);
  if (params.w) {
    const parsed = new Date(params.w + 'T00:00:00');
    if (!isNaN(parsed.getTime())) poniedzialek = getMonday(parsed);
  }

  const niedziela = addDays(poniedzialek, 6);
  const odTygodnia = toISO(poniedzialek);
  const doTygodnia = toISO(niedziela);

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaIdFast();
  if (!druzynaId) redirect('/druzyny/nowa');

  const activeDruzyna = await getActiveDruzyna();

  const biezacyMiesiac = dzisStr.substring(0, 7);
  const startMiesiaca = `${biezacyMiesiac}-01`;
  const koniecMiesiaca = toISO(new Date(teraz.getFullYear(), teraz.getMonth() + 1, 0));

  // UŻYWA RPC DLA TYGODNIA I MIESIĄCA
  const [tydzienRes, nadchodzaceRes, miesiacRes] = await Promise.all([
    supabase.rpc('get_treningi_z_frekwencja', {
      p_druzyna_id: druzynaId, p_od: odTygodnia, p_do: doTygodnia
    }),
    supabase
      .from('treningi')
      .select('id, data, godzina, typ, przeciwnik, miejsce, notatki, cykl_id, is_home, wynik_gospodarzy, wynik_gosci')
      .eq('druzyna_id', druzynaId)
      .gt('data', doTygodnia)
      .order('data', { ascending: true })
      .order('godzina', { ascending: true })
      .limit(5),
    supabase.rpc('get_treningi_z_frekwencja', {
      p_druzyna_id: druzynaId, p_od: startMiesiaca, p_do: koniecMiesiaca
    }),
  ]);

  const tydzien = (tydzienRes.data ?? []) as any[];
  const nadchodzace = (nadchodzaceRes.data ?? []) as any[];
  const miesiac = (miesiacRes.data ?? []) as any[];

  const eventMap: Record<string, any[]> = {};
  [...tydzien, ...nadchodzace].forEach((t) => {
    if (!eventMap[t.data]) eventMap[t.data] = [];
    eventMap[t.data].push({ ...t, obecnosc: [] }); // Pusta tablica dla kompatybilności z DashboardClient
  });

  const stats: Record<string, { obecni: number; nieobecni: number }> = {};
  tydzien.forEach((t) => {
    stats[String(t.id)] = { obecni: t.obecni, nieobecni: t.nieobecni };
  });

  let miesObecni = 0;
  let miesTotal = 0;
  miesiac.forEach((t) => {
    miesObecni += t.obecni;
    miesTotal += t.obecni + t.nieobecni;
  });

  const dni = Array.from({ length: 7 }, (_, i) => toISO(addDays(poniedzialek, i)));
  const jestWTygodniu = dzisStr >= odTygodnia && dzisStr <= doTygodnia;

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
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
        initialDni={dni}
        poniedzialekISO={odTygodnia}
        niedzielaISO={doTygodnia}
        prevWeek={toISO(addDays(poniedzialek, -7))}
        nextWeek={toISO(addDays(poniedzialek, 7))}
        jestWTygodniu={jestWTygodniu}
        eventMap={eventMap}
        stats={stats}
        frekwencjaMiesiaca={{ obecni: miesObecni, total: miesTotal }}
      />
    </div>
  );
}