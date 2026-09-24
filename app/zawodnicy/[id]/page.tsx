import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Pencil,
  Phone,
  Calendar,
} from 'lucide-react';

export default async function KartaZawodnika({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum)) notFound();

  const supabase = await createClient();

  const { data: zawodnik, error: errZ } = await supabase
    .from('zawodnicy')
    .select('*')
    .eq('id', idNum)
    .single();

  if (errZ || !zawodnik) notFound();

  const { data: wpisy } = await supabase
    .from('obecnosc')
    .select('status, trening_id')
    .eq('zawodnik_id', idNum);

  const { data: treningi } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik');

  const treningMap = new Map<number, any>();
  (treningi ?? []).forEach((t) => treningMap.set(t.id, t));

  const stats = {
    obecny: 0,
    spozniony: 0,
    nieobecny: 0,
    usprawiedliwiony: 0,
    total: 0,
  };
  (wpisy ?? []).forEach((w) => {
    stats.total += 1;
    if (w.status in stats) {
      stats[w.status as keyof typeof stats] += 1;
    }
  });

  const obecnosci = stats.obecny + stats.spozniony;
  const procent = stats.total > 0 ? Math.round((obecnosci / stats.total) * 100) : 0;

  const ostatnie = (wpisy ?? [])
    .map((w) => ({ ...w, trening: treningMap.get(w.trening_id) }))
    .filter((w) => w.trening)
    .sort((a, b) => (a.trening.data < b.trening.data ? 1 : -1))
    .slice(0, 10);

  const statusInfo = (s: string) => {
    if (s === 'obecny')
      return { icon: CheckCircle2, color: 'text-green-400', label: 'Obecny' };
    if (s === 'spozniony')
      return { icon: Clock, color: 'text-yellow-400', label: 'Spóźniony' };
    if (s === 'nieobecny')
      return { icon: XCircle, color: 'text-red-400', label: 'Nieobecny' };
    if (s === 'usprawiedliwiony')
      return { icon: FileText, color: 'text-blue-400', label: 'Usprawiedliwiony' };
    return { icon: CheckCircle2, color: 'text-slate-400', label: s };
  };

  const procentKolor =
    procent >= 80
      ? 'from-green-500 to-green-700 shadow-green-900/30'
      : procent >= 60
      ? 'from-yellow-500 to-yellow-700 shadow-yellow-900/30'
      : 'from-red-500 to-red-700 shadow-red-900/30';

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 md:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 flex items-center gap-3 animate-fadeIn">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold text-slate-400">Karta zawodnika</h1>
        </header>

        {/* Nagłówek z danymi */}
        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 mb-4 animate-fadeIn">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center font-bold text-2xl shadow-lg shadow-green-900/40 flex-shrink-0">
              {zawodnik.numer ?? '—'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">
                {zawodnik.imie} {zawodnik.nazwisko}
              </h2>
              <p className="text-sm text-slate-400">
                {zawodnik.pozycja ?? 'Brak pozycji'}
                {zawodnik.rocznik && ` · rocznik ${zawodnik.rocznik}`}
              </p>
            </div>
            <Link
              href={`/zawodnicy/${idNum}/edytuj`}
              className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center transition-colors flex-shrink-0"
              title="Edytuj"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          </div>

          {zawodnik.kontakt_rodzica && (
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 rounded-lg px-3 py-2">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>{zawodnik.kontakt_rodzica}</span>
            </div>
          )}
        </div>

        {/* Frekwencja */}
        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 mb-4 animate-fadeIn">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">
            Frekwencja
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-bold">{procent}</span>
            <span className="text-2xl text-slate-500">%</span>
            <span className="text-sm text-slate-400 ml-auto">
              {obecnosci} / {stats.total} treningów
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 mb-5 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${procentKolor} transition-all duration-700`}
              style={{ width: `${procent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatBox
              icon={CheckCircle2}
              color="text-green-400"
              label="Obecny"
              value={stats.obecny}
            />
            <StatBox
              icon={Clock}
              color="text-yellow-400"
              label="Spóźniony"
              value={stats.spozniony}
            />
            <StatBox
              icon={XCircle}
              color="text-red-400"
              label="Nieobecny"
              value={stats.nieobecny}
            />
            <StatBox
              icon={FileText}
              color="text-blue-400"
              label="Usprawiedliwiony"
              value={stats.usprawiedliwiony}
            />
          </div>
        </div>

        {/* Ostatnie treningi */}
        {ostatnie.length > 0 && (
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 animate-fadeIn">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">
              Ostatnie treningi
            </div>
            <ul className="space-y-1">
              {ostatnie.map((w) => {
                const info = statusInfo(w.status);
                const Icon = info.icon;
                return (
                  <li
                    key={`${w.trening_id}-${w.status}`}
                    className="flex items-center gap-3 text-sm py-2 px-2 rounded-lg hover:bg-slate-900/50 transition-colors"
                  >
                    <Icon className={`w-4 h-4 ${info.color} flex-shrink-0`} />
                    <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="flex-1 text-slate-300">
                      {new Date(w.trening.data).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                      })}{' '}
                      · <span className="capitalize">{w.trening.typ}</span>
                      {w.trening.przeciwnik && (
                        <span className="text-slate-500">
                          {' '}
                          vs {w.trening.przeciwnik}
                        </span>
                      )}
                    </span>
                    <span className={`text-xs ${info.color}`}>{info.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Notatki */}
        {zawodnik.notatki && (
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 mt-4 animate-fadeIn">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
              Notatki
            </div>
            <div className="text-sm whitespace-pre-wrap text-slate-300">
              {zawodnik.notatki}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatBox({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: any;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl px-3 py-2.5">
      <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 truncate">{label}</div>
        <div className="font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}