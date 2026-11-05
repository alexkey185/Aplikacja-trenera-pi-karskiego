import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, getActiveDruzyna } from '@/lib/druzyny';
import { getDzisISO } from '@/lib/dates';
import { KadraClient } from './KadraClient';
import { TopBar } from '@/components/TopBar';

export default async function Kadra() {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const activeDruzyna = await getActiveDruzyna();
  const dzisISO = getDzisISO();

  const { data: ostatnieWydarzenia } = await supabase
    .from('treningi').select('id, data, godzina, typ').eq('druzyna_id', druzynaId).lte('data', dzisISO).order('data', { ascending: false }).order('godzina', { ascending: false }).limit(5);

  const last5 = ostatnieWydarzenia ?? [];
  const last5Ids = last5.map((t) => t.id);

  const [zawodnicyRes, obecnosciRes, frekwencjaRes] = await Promise.all([
    supabase.from('zawodnicy').select('id, imie, nazwisko, rocznik, pozycja, numer, kontakt_rodzica, notatki').eq('druzyna_id', druzynaId),
    last5Ids.length > 0 ? supabase.from('obecnosc').select('zawodnik_id, trening_id, status').in('trening_id', last5Ids) : Promise.resolve({ data: [] }),
    supabase.rpc('get_frekwencja_zawodnikow', { p_druzyna_id: druzynaId }),
  ]);

  return (
    <KadraClient 
      zawodnicy={zawodnicyRes.data ?? []} 
      last5={last5} 
      obecnosci={obecnosciRes.data ?? []} 
      frekwencja={frekwencjaRes.data ?? []} 
      logoUrl={activeDruzyna?.logo_url ?? null}
      topBar={<TopBar />} /* <-- DODANO PRZEKAZANIE TOPBAR */
    />
  );
}