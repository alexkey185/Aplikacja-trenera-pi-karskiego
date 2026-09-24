import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export default async function Kalendarz() {
  noStore();
  const supabase = await createClient();

  const { data: treningi, error } = await supabase
    .from('treningi')
    .select('*')
    .order('data', { ascending: true });

  const { data: obecnosci } = await supabase
    .from('obecnosc')
    .select('trening_id, status');

  const stats = new Map<number, { obecni: number; total: number }>();
  (obecnosci ?? []).forEach((o) => {
    const s = stats.get(o.trening_id) ?? { obecni: 0, total: 0 };
    s.total += 1;
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    stats.set(o.trening_id, s);
  });

  const dzis = new Date().toISOString().split('T')[0];
  const nadchodzace = (treningi ?? []).filter((t) => t.data >= dzis);
  const minione = (treningi ?? []).filter((t) => t.data < dzis).reverse();

  const typIkona = (typ: string) => {
    if (typ === 'mecz') return '🟥';
    if (typ === 'sparing') return '🟧';
    if (typ === 'turniej') return '🟪';
    return '🟦';
  };

  const Karta = ({ t }: { t: any }) => {
    const s = stats.get(t.id);
    return (
      <li className="bg-slate-800 rounded-lg p-4 flex items-center gap-4">
        <Link
          href={`/kalendarz/${t.id}/obecnosc`}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
          <div className="text-2xl">{typIkona(t.typ)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">
              {new Date(t.data).toLocaleDateString('pl-PL', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
              })}{' '}
              · {t.godzina}
            </div>
            <div className="text-sm text-slate-400 capitalize truncate">
              {t.typ}
              {t.przeciwnik ? ` · vs ${t.przeciwnik}` : ''}
              {t.miejsce ? ` · ${t.miejsce}` : ''}
            </div>
            {s && s.total > 0 && (
              <div className="text-xs mt-1">
                <span
                  className={
                    s.obecni === s.total
                      ? 'text-green-400'
                      : s.obecni / s.total >= 0.7
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }
                >
                  👥 {s.obecni}/{s.total} obecnych
                </span>
              </div>
            )}
          </div>
        </Link>
        <Link
          href={`/kalendarz/${t.id}/edytuj`}
          className="text-slate-400 hover:text-white text-sm px-3 py-1 border border-slate-700 rounded-lg transition-colors flex-shrink-0"
        >
          Edytuj
        </Link>
      </li>
    );
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ←
            </Link>
            <h1 className="text-3xl font-bold">📅 Kalendarz</h1>
          </div>
          <Link
            href="/kalendarz/nowy"
            className="bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Dodaj
          </Link>
        </header>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 mb-4 text-sm">
            Błąd: {error.message}
          </div>
        )}

        {(!treningi || treningi.length === 0) && (
          <div className="bg-slate-800 rounded-lg p-6 text-center text-slate-400">
            Brak wydarzeń w kalendarzu.
            <br />
            Dodaj pierwszy trening lub mecz.
          </div>
        )}

        {nadchodzace.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">
              Nadchodzące
            </h2>
            <ul className="space-y-3 mb-8">
              {nadchodzace.map((t) => (
                <Karta key={t.id} t={t} />
              ))}
            </ul>
          </>
        )}

        {minione.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">
              Minione
            </h2>
            <ul className="space-y-3 opacity-60">
              {minione.map((t) => (
                <Karta key={t.id} t={t} />
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}