import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { TopBar } from '@/components/TopBar';
import { ObecnoscForm } from './ObecnoscForm';
import {
  ArrowLeft,
  Users,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Pencil,
} from 'lucide-react';

export default async function Obecnosc({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const { data: trening, error: errT } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, miejsce')
    .eq('id', idNum)
    .eq('druzyna_id', druzynaId)
    .single();
  if (errT || !trening) notFound();

  const { data: zawodnicy } = await supabase
    .from('zawodnicy')
    .select('id, imie, nazwisko, numer, pozycja')
    .eq('druzyna_id', druzynaId)
    .order('nazwisko', { ascending: true });

  const { data: obecnosc } = await supabase
    .from('obecnosc')
    .select('zawodnik_id, status')
    .eq('trening_id', idNum);

  const initialStatus: Record<number, string> = {};
  (obecnosc ?? []).forEach((o) => {
    initialStatus[o.zawodnik_id] = o.status;
  });

  const { data: previousTrening } = await supabase
    .from('treningi')
    .select('id')
    .eq('typ', trening.typ)
    .eq('druzyna_id', druzynaId)
    .lt('data', trening.data)
    .order('data', { ascending: false })
    .limit(1)
    .maybeSingle();

  const previousStatus: Record<number, string> = {};
  if (previousTrening) {
    const { data: prevObecnosc } = await supabase
      .from('obecnosc')
      .select('zawodnik_id, status')
      .eq('trening_id', previousTrening.id);
    (prevObecnosc ?? []).forEach((o) => {
      previousStatus[o.zawodnik_id] = o.status;
    });
  }

  const typIkona = trening.typ === 'mecz' ? '🏆' : '🏃';

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <Link
          href="/kalendarz"
          className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">
              Obecność
            </h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 truncate capitalize drop-shadow">
              {typIkona} {trening.typ}
              {trening.przeciwnik && ` vs ${trening.przeciwnik}`}
            </p>
          </div>
        </div>
        <TopBar />
      </header>

      {/* ═══════════════════════════════════════════════════════════
          Pasek informacyjny z przyciskiem edycji treningu.
          Info (data, godzina, miejsce) po lewej, edycja po prawej.
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-5 animate-fadeIn shadow-xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-white/90">
              <CalendarIcon className="w-4 h-4 text-white/50 flex-shrink-0" />
              <span className="font-medium capitalize">
                {new Date(trening.data + 'T00:00:00').toLocaleDateString('pl-PL', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Clock className="w-4 h-4 text-white/50 flex-shrink-0" />
              <span className="font-medium">{trening.godzina}</span>
            </div>
            {trening.miejsce && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-4 h-4 text-white/50 flex-shrink-0" />
                <span className="truncate">{trening.miejsce}</span>
              </div>
            )}
          </div>

          <Link
            href={`/kalendarz/${trening.id}/edytuj`}
            title="Edytuj wydarzenie"
            aria-label="Edytuj wydarzenie"
            className="group flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-blue-500/15 border border-white/10 hover:border-blue-400/40 text-white/60 hover:text-blue-300 text-xs font-semibold transition-all"
          >
            <Pencil className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Edytuj</span>
          </Link>
        </div>
      </div>

      {!zawodnicy || zawodnicy.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center animate-fadeIn shadow-xl shadow-black/40">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white/50" strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-white drop-shadow">Brak zawodników</h3>
          <p className="text-sm text-white/70">Dodaj najpierw zawodników w zakładce Kadra.</p>
        </div>
      ) : (
        <ObecnoscForm
          treningId={idNum}
          zawodnicy={zawodnicy}
          initialStatus={initialStatus}
          previousStatus={previousStatus}
          typTreningu={trening.typ}
        />
      )}
    </div>
  );
}