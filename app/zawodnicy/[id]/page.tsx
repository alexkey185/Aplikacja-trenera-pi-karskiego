import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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

  const statusIkona = (s: string) => {
    if (s === 'obecny') return '✅';
    if (s === 'spozniony') return '⏰';
    if (s === 'nieobecny') return '❌';
    if (s === 'usprawiedliwiony') return '📝';
    return '•';
  };

  const statusLabel = (s: string) => {
    if (s === 'obecny') return 'Obecny';
    if (s === 'spozniony') return 'Spóźniony';
    if (s === 'nieobecny') return 'Nieobecny';
    if (s === 'usprawiedliwiony') return 'Usprawiedliwiony';
    return s;
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ←
          </Link>
          <h1 className="text-2xl font-bold">
            {zawodnik.imie} {zawodnik.nazwisko}
          </h1>
        </header>

        <div className="bg-slate-800 rounded-lg p-5 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center font-bold text-xl">
            {zawodnik.numer ?? '—'}
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold">
              {zawodnik.imie} {zawodnik.nazwisko}
            </div>
            <div className="text-sm text-slate-400">
              {zawodnik.pozycja ?? 'Brak pozycji'} · {zawodnik.rocznik ?? '—'}
            </div>
            {zawodnik.kontakt_rodzica && (
              <div className="text-xs text-slate-500 mt-1">
                📞 {zawodnik.kontakt_rodzica}
              </div>
            )}
          </div>
          <Link
            href={`/zawodnicy/${idNum}/edytuj`}
            className="text-slate-400 hover:text-white text-sm px-3 py-1 border border-slate-700 rounded-lg transition-colors"
          >
            Edytuj
          </Link>
        </div>

        <div className="bg-slate-800 rounded-lg p-5 mb-4">
          <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">
            Frekwencja
          </div>
          <div className="text-4xl font-bold mb-2">{procent}%</div>
          <div className="w-full bg-slate-900 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className={`h-full ${
                procent >= 80
                  ? 'bg-green-500'
                  : procent >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${procent}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">✅ Obecny</span>
              <span className="font-semibold">{stats.obecny}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">⏰ Spóźniony</span>
              <span className="font-semibold">{stats.spozniony}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">❌ Nieobecny</span>
              <span className="font-semibold">{stats.nieobecny}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">📝 Uspraw.</span>
              <span className="font-semibold">{stats.usprawiedliwiony}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700">
            Łącznie zapisanych treningów: {stats.total}
          </div>
        </div>

        {ostatnie.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-5">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-3">
              Ostatnie treningi
            </div>
            <ul className="space-y-2">
              {ostatnie.map((w) => (
                <li
                  key={`${w.trening_id}-${w.status}`}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-lg">{statusIkona(w.status)}</span>
                  <span className="flex-1">
                    {new Date(w.trening.data).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                    })}{' '}
                    · {w.trening.typ}
                    {w.trening.przeciwnik ? ` vs ${w.trening.przeciwnik}` : ''}
                  </span>
                  <span className="text-xs text-slate-500">
                    {statusLabel(w.status)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {zawodnik.notatki && (
          <div className="bg-slate-800 rounded-lg p-5 mt-4">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">
              Notatki
            </div>
            <div className="text-sm whitespace-pre-wrap">{zawodnik.notatki}</div>
          </div>
        )}
      </div>
    </main>
  );
}