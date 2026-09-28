import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/UserAvatar';
import { Users, Plus, Search } from 'lucide-react';

// Definicja typu dla zawodnika (zamiast any)
type Zawodnik = {
  id: number;
  imie: string;
  nazwisko: string;
  rocznik: number | null;
  pozycja: string | null;
  numer: number | null;
  kontakt_rodzica: string | null;
  notatki: string | null;
};

export default async function Kadra({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || '';

  const supabase = await createClient();

  // Budowanie zapytania z opcjonalnym filtrowaniem
  let query = supabase
    .from('zawodnicy')
    .select('id, imie, nazwisko, rocznik, pozycja, numer, kontakt_rodzica, notatki')
    .order('nazwisko', { ascending: true });

  if (q) {
    query = query.or(`imie.ilike.%${q}%,nazwisko.ilike.%${q}%`);
  }

  const { data: zawodnicy, error } = await query;

  const { data: obecnosci } = await supabase
    .from('obecnosc')
    .select('zawodnik_id, status');

  const frekwencjaMap = new Map<number, { obecni: number; total: number }>();
  (obecnosci ?? []).forEach((o) => {
    const s = frekwencjaMap.get(o.zawodnik_id) ?? { obecni: 0, total: 0 };
    s.total += 1;
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    frekwencjaMap.set(o.zawodnik_id, s);
  });

  const inicjaly = (imie: string, nazwisko: string) => {
    return `${imie.charAt(0)}${nazwisko.charAt(0)}`.toUpperCase();
  };

  const liczba = zawodnicy?.length ?? 0;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.png"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src="/talent-bg.png"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 lg:p-8 pb-28">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-2xl">
                    <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold leading-tight text-white drop-shadow-lg tracking-wide">
                    LISTA ZAWODNIKÓW
                  </h1>
                  <p className="text-xs text-white/60 font-medium mt-0.5">
                    {liczba} {liczba === 1 ? 'zawodnik' : 'zawodników'} na liście
                  </p>
                </div>
              </div>
              <UserAvatar />
            </div>

            {/* Pasek wyszukiwania zamiast usuniętych przycisków nawigacji */}
            <form action="/kadra" method="GET" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                name="q"
                type="text"
                defaultValue={q}
                placeholder="Szukaj zawodnika..."
                className="w-full bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-green-400/50 transition-all"
              />
            </form>
          </header>

          {error && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-2xl p-4 mb-4 text-sm animate-fadeIn text-red-200">
              Błąd: {error.message}
            </div>
          )}

          {liczba === 0 ? (
            <EmptyState />
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0 pb-28">
              {zawodnicy!.map((z: Zawodnik, i: number) => {
                const s = frekwencjaMap.get(z.id);
                const procent =
                  s && s.total > 0 ? Math.round((s.obecni / s.total) * 100) : null;

                return (
                  <li
                    key={z.id}
                    className={`group relative bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/50 animate-fadeIn stagger-${Math.min(
                      i + 1,
                      8
                    )}`}
                  >
                    <Link
                      href={`/zawodnicy/${z.id}`}
                      className="flex items-center gap-3 p-3 min-w-0"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-white/70 text-base shadow-inner">
                          {inicjaly(z.imie, z.nazwisko)}
                        </div>
                        {z.numer != null && (
                          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-slate-950 border border-amber-400/40 text-amber-400 text-[10px] font-bold leading-none shadow-lg">
                            #{z.numer}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate uppercase tracking-wide drop-shadow">
                          {z.imie} {z.nazwisko}
                        </div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest font-medium truncate mt-0.5">
                          Rocznik {z.rocznik ?? '—'}
                        </div>
                        {procent !== null && (
                          <div className="text-[10px] text-white/40 mt-0.5">
                            Frekwencja:{' '}
                            <span
                              className={
                                procent >= 80
                                  ? 'text-green-400 font-semibold'
                                  : procent >= 50
                                  ? 'text-yellow-400 font-semibold'
                                  : 'text-red-400 font-semibold'
                              }
                            >
                              {procent}%
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <Link
        href="/zawodnicy/nowy"
        className="group fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center justify-center text-white shadow-2xl shadow-green-500/50 hover:shadow-green-400/70 transition-all hover:scale-110 active:scale-95 animate-glow"
        title="Dodaj zawodnika"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" strokeWidth={2.5} />
      </Link>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <Users className="w-10 h-10 text-green-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-bold text-xl mb-2 text-white drop-shadow">
          Zacznijmy od składu
        </h3>
        <p className="text-sm text-white/60 mb-6 max-w-xs mx-auto">
          Dodaj pierwszego zawodnika, żeby zarządzać drużyną, treningami i frekwencją.
        </p>
        <Link
          href="/zawodnicy/nowy"
          className="group inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Dodaj pierwszego zawodnika
        </Link>
      </div>
    </div>
  );
}