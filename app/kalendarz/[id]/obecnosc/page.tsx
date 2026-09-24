import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ObecnoscForm } from './ObecnoscForm';
import { ArrowLeft, Users, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

export default async function Obecnosc({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum)) notFound();

  const supabase = await createClient();

  const { data: trening, error: errT } = await supabase
    .from('treningi')
    .select('*')
    .eq('id', idNum)
    .single();

  if (errT || !trening) notFound();

  const { data: zawodnicy } = await supabase
    .from('zawodnicy')
    .select('*')
    .order('nazwisko', { ascending: true });

  const { data: obecnosc } = await supabase
    .from('obecnosc')
    .select('*')
    .eq('trening_id', idNum);

  const initialStatus: Record<number, string> = {};
  (obecnosc ?? []).forEach((o) => {
    initialStatus[o.zawodnik_id] = o.status;
  });

  const typIkona = trening.typ === 'mecz' ? '🏆' : '🟦';

  return (
    <main className="min-h-screen text-white p-4 md:p-6 pb-28">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 flex items-center gap-3 animate-fadeIn">
          <Link
            href="/kalendarz"
            className="w-10 h-10 rounded-xl glass flex items-center justify-center transition-colors hover:bg-slate-800/70"
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
              <h1 className="text-xl font-bold leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Obecność
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate capitalize">
                {typIkona} {trening.typ}
                {trening.przeciwnik && ` vs ${trening.przeciwnik}`}
              </p>
            </div>
          </div>
        </header>

        {/* Karta treningu */}
        <div className="glass rounded-2xl p-4 mb-5 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <CalendarIcon className="w-4 h-4 text-slate-500" />
              <span className="font-medium capitalize">
                {new Date(trening.data).toLocaleDateString('pl-PL', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{trening.godzina}</span>
            </div>
            {trening.miejsce && (
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="truncate">{trening.miejsce}</span>
              </div>
            )}
          </div>
        </div>

        {!zawodnicy || zawodnicy.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-500" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-lg mb-2">Brak zawodników</h3>
            <p className="text-sm text-slate-400">
              Dodaj najpierw zawodników w zakładce Kadra.
            </p>
          </div>
        ) : (
          <ObecnoscForm
            treningId={idNum}
            zawodnicy={zawodnicy}
            initialStatus={initialStatus}
          />
        )}
      </div>
    </main>
  );
}