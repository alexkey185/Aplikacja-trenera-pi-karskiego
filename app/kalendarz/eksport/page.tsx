import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, getActiveDruzyna } from '@/lib/druzyny';
import { pad2, toISO } from '@/lib/dates';
import { EksportClient } from './EksportClient';

export default async function EksportPage() {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const activeDruzyna = await getActiveDruzyna();
  if (!activeDruzyna) redirect('/druzyny/nowa');

  const dzis = new Date();
  const poniedzialek = new Date(dzis);
  const day = poniedzialek.getDay();
  const diff = poniedzialek.getDate() - day + (day === 0 ? -6 : 1);
  poniedzialek.setDate(diff);
  poniedzialek.setHours(0, 0, 0, 0);

  const niedziela = new Date(poniedzialek);
  niedziela.setDate(niedziela.getDate() + 6);

  const { data: rawTreningi } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, miejsce, notatki')
    .eq('druzyna_id', druzynaId)
    .gte('data', toISO(poniedzialek))
    .lte('data', toISO(niedziela))
    .order('godzina', { ascending: true });

  const lista = rawTreningi ?? [];

  const eventMap: Record<string, any[]> = {};
  lista.forEach((t) => {
    if (!eventMap[t.data]) eventMap[t.data] = [];
    eventMap[t.data].push(t);
  });

  const dni = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(poniedzialek);
    d.setDate(d.getDate() + i);
    const iso = toISO(d);
    return {
      iso,
      data: iso,
      events: eventMap[iso] ?? [],
    };
  });

  const stats = {
    treningi: lista.filter(t => t.typ === 'trening').length,
    mecze: lista.filter(t => t.typ === 'mecz').length,
    sparingi: lista.filter(t => t.typ === 'sparing').length,
    turnieje: lista.filter(t => t.typ === 'turniej').length,
  };

  const zakres = `${pad2(poniedzialek.getDate())}.${pad2(poniedzialek.getMonth() + 1)} — ${pad2(niedziela.getDate())}.${pad2(niedziela.getMonth() + 1)}`;
  const dataGen = dzis.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <EksportClient
      dni={dni}
      stats={stats}
      zakres={zakres}
      dataGen={dataGen}
    />
  );
}