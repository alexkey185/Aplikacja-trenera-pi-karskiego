import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
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

  if (treningiRes.error) {
    console.error('Błąd pobierania treningów:', treningiRes.error);
  }

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

  const jestWTygodniu =
    dzisStr >= toISO(poniedzialek) && dzisStr <= toISO(niedziela);

  return (
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
  );
}