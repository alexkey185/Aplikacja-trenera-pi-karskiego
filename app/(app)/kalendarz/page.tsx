import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaIdFast, getActiveDruzyna } from '@/lib/druzyny';
import { addDays, toISO, getMonday } from '@/lib/dates';
import { redirect } from 'next/navigation';
import { KalendarzClient } from './KalendarzClient';
import { TopBar } from '@/components/TopBar';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { Calendar as CalendarIcon } from 'lucide-react';

export default async function KalendarzPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const params = await searchParams;
  const dzis = new Date();
  
  // Ustalamy poniedziałek bieżącego tygodnia (lub tego z parametru ?w=)
  let poniedzialek = getMonday(dzis);
  if (params.w) {
    const parsed = new Date(params.w + 'T00:00:00');
    if (!isNaN(parsed.getTime())) poniedzialek = getMonday(parsed);
  }

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaIdFast();
  if (!druzynaId) redirect('/druzyny/nowa');

  const activeDruzyna = await getActiveDruzyna();

  // Zakres: 2 miesiące wstecz i 3 miesiące w przód
  const od = toISO(addDays(poniedzialek, -60)); 
  const do_ = toISO(addDays(poniedzialek, 90));

  // ZOPTYMALIZOWANE RPC (pobiera gotowe statystyki frekwencji z bazy)
  const { data } = await supabase.rpc('get_treningi_z_frekwencja', {
    p_druzyna_id: druzynaId,
    p_od: od,
    p_do: do_,
  });

  const treningi = data ?? [];

  // Obliczamy dni dla górnego paska tygodnia (na wypadek, gdyby był potrzebny w innym miejscu)
  const dni = Array.from({ length: 7 }, (_, i) => toISO(addDays(poniedzialek, i)));

  return (
    <div className="w-full">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <PageHeaderLogo icon={CalendarIcon} logoUrl={activeDruzyna?.logo_url ?? null} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Kalendarz</h1>
          <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
            Twój harmonogram treningów i meczów
          </p>
        </div>
        <TopBar />
      </header>

      {/* Przekazujemy dane do nowego, dwukolumnowego widoku */}
      <KalendarzClient initialTreningi={treningi} />
    </div>
  );
}