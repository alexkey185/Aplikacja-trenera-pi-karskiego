import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { notFound, redirect } from 'next/navigation';
import { EksportClient } from './EksportClient';

// ═══════════════════════════════════════════════════════════════
// Helpery
// ═══════════════════════════════════════════════════════════════
function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toISO(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default async function EksportPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const params = await searchParams;

  const teraz = new Date();
  let poniedzialek = getMonday(teraz);
  if (params.w) {
    const parsed = new Date(params.w + 'T00:00:00');
    if (!isNaN(parsed.getTime())) {
      poniedzialek = getMonday(parsed);
    }
  }

  const niedziela = addDays(poniedzialek, 6);
  const poniedzialekISO = toISO(poniedzialek);
  const niedzielaISO = toISO(niedziela);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(poniedzialekISO)) notFound();

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  // ═══════════════════════════════════════════════════════════
  // POPRAWKA: filtr po druzyna_id — wcześniej mieszał drużyny
  // ═══════════════════════════════════════════════════════════
  const { data: treningi } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, miejsce, notatki')
    .eq('druzyna_id', druzynaId)
    .gte('data', poniedzialekISO)
    .lte('data', niedzielaISO)
    .order('data', { ascending: true })
    .order('godzina', { ascending: true });

  const { data: user } = await supabase.auth.getUser();

  const events = treningi ?? [];
  const stats = {
    treningi: events.filter((t) => t.typ === 'trening').length,
    mecze: events.filter((t) => t.typ === 'mecz').length,
    sparingi: events.filter((t) => t.typ === 'sparing').length,
    turnieje: events.filter((t) => t.typ === 'turniej').length,
  };

  const zakres = `${pad2(poniedzialek.getDate())}.${pad2(
    poniedzialek.getMonth() + 1
  )} — ${pad2(niedziela.getDate())}.${pad2(niedziela.getMonth() + 1)}`;

  const dni = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(poniedzialek, i);
    const iso = toISO(d);
    return {
      iso,
      data: d,
      events: events.filter((e) => e.data === iso),
    };
  });

  const dataGen = `${pad2(teraz.getDate())}.${pad2(teraz.getMonth() + 1)}.${teraz.getFullYear()}`;

  return (
    <EksportClient
      dni={dni}
      stats={stats}
      zakres={zakres}
      dataGen={dataGen}
      poniedzialek={poniedzialekISO}
      niedziela={niedzielaISO}
      email={user?.user?.email ?? ''}
    />
  );
}