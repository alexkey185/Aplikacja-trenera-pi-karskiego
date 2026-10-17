import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { TopBar } from '@/components/TopBar';
import { OnboardingChecklist } from '@/components/OnboardingChecklist';
import { DashboardClient } from './DashboardClient';

function getDzisISO(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
}
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

type TreningZObecnoscia = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  obecnosc: { trening_id: number; status: string }[] | null;
};

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
    if (!isNaN(parsed.getTime())) {
      poniedzialek = getMonday(parsed);
    }
  }

  const niedziela = addDays(poniedzialek, 6);

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const odD = new Date(teraz.getFullYear(), teraz.getMonth() - 1, 1);
  const doD = new Date(teraz.getFullYear(), teraz.getMonth() + 2, 0);

  const [treningiRes, zawodnicyCountRes, treningiCountRes] = await Promise.all([
    supabase
      .from('treningi')
      .select(`
        id, data, godzina, typ, przeciwnik, miejsce, notatki,
        obecnosc (trening_id, status)
      `)
      .eq('druzyna_id', druzynaId)
      .gte('data', toISO(odD))
      .lte('data', toISO(doD))
      .order('data', { ascending: true })
      .order('godzina', { ascending: true }),

    supabase
      .from('zawodnicy')
      .select('id', { count: 'exact', head: true })
      .eq('druzyna_id', druzynaId),

    supabase
      .from('treningi')
      .select('id', { count: 'exact', head: true })
      .eq('druzyna_id', druzynaId),
  ]);

  const lista = (treningiRes.data ?? []) as unknown as TreningZObecnoscia[];
  const hasZawodnicy = (zawodnicyCountRes.count ?? 0) > 0;
  const hasTreningi = (treningiCountRes.count ?? 0) > 0;

  const wszystkieObecnosci = lista.flatMap((t) => t.obecnosc ?? []);
  const stats = new Map<number, { obecni: number; nieobecni: number }>();
  lista.forEach((t) => {
    let obecni = 0;
    let nieobecni = 0;
    for (const o of t.obecnosc ?? []) {
      if (o.status === 'obecny' || o.status === 'spozniony') obecni++;
      else nieobecni++;
    }
    stats.set(t.id, { obecni, nieobecni });
  });

  const dni = Array.from({ length: 7 }, (_, i) => addDays(poniedzialek, i));

  const eventMap: Record<string, TreningZObecnoscia[]> = {};
  lista.forEach((t) => {
    if (!eventMap[t.data]) eventMap[t.data] = [];
    eventMap[t.data].push(t);
  });

  const jestWTygodniu = dzisStr >= toISO(poniedzialek) && dzisStr <= toISO(niedziela);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-xl">D</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">Tydzień</h1>
              <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow capitalize">
                {poniedzialek.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <TopBar />
        </div>
      </header>

      <OnboardingChecklist
        hasDruzyna={true}
        hasZawodnicy={hasZawodnicy}
        hasTreningi={hasTreningi}
      />

      <DashboardClient
        initialDni={dni}
        poniedzialekISO={toISO(poniedzialek)}
        niedzielaISO={toISO(niedziela)}
        prevWeek={toISO(addDays(poniedzialek, -7))}
        nextWeek={toISO(addDays(poniedzialek, 7))}
        jestWTygodniu={jestWTygodniu}
        eventMap={eventMap}
        stats={stats}
        wszystkieObecnosci={wszystkieObecnosci}
      />
    </div>
  );
}