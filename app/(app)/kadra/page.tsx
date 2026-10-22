import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, getActiveDruzyna } from '@/lib/druzyny';
import { getDzisISO } from '@/lib/dates';
import { TopBar } from '@/components/TopBar';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { Users, Plus, Search, ArrowUpDown, Upload } from 'lucide-react';

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

type SortKey = 'alpha' | 'rocznik' | 'frekwencja' | 'numer';

const SORT_LABELS: Record<SortKey, string> = {
  alpha: 'Alfabetycznie',
  rocznik: 'Rocznik',
  frekwencja: 'Frekwencja',
  numer: 'Numer',
};

function kolorKropki(status: string): string {
  if (status === 'obecny' || status === 'spozniony') return 'bg-green-400';
  if (status === 'nieobecny' || status === 'usprawiedliwiony') return 'bg-red-400';
  return 'bg-white/15';
}

function labelStatusu(status: string): string {
  if (status === 'obecny') return 'Obecny';
  if (status === 'spozniony') return 'Spóźniony';
  if (status === 'nieobecny') return 'Nieobecny';
  if (status === 'usprawiedliwiony') return 'Usprawiedliwiony';
  return 'Brak wpisu';
}

export default async function Kadra({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const sortParam = params.sort as SortKey | undefined;
  const sort: SortKey = ['alpha', 'rocznik', 'frekwencja', 'numer'].includes(sortParam ?? '')
    ? (sortParam as SortKey)
    : 'alpha';

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const activeDruzyna = await getActiveDruzyna();

  const dzisISO = getDzisISO();

  const { data: ostatnieWydarzenia } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ')
    .eq('druzyna_id', druzynaId)
    .lte('data', dzisISO)
    .order('data', { ascending: false })
    .order('godzina', { ascending: false })
    .limit(5);

  const last5 = ostatnieWydarzenia ?? [];
  const last5Ids = last5.map((t) => t.id);

  let zawQuery = supabase
    .from('zawodnicy')
    .select('id, imie, nazwisko, rocznik, pozycja, numer, kontakt_rodzica, notatki')
    .eq('druzyna_id', druzynaId);

  if (q) {
    const safe = q.replace(/[,()%]/g, '\\$&');
    zawQuery = zawQuery.or(`imie.ilike.%${safe}%,nazwisko.ilike.%${safe}%`);
  }

  const [zawodnicyRes, obecnosciRes, frekwencjaRes] = await Promise.all([
    zawQuery,
    last5Ids.length > 0
      ? supabase
          .from('obecnosc')
          .select('zawodnik_id, trening_id, status')
          .in('trening_id', last5Ids)
      : Promise.resolve({
          data: [] as { zawodnik_id: number; trening_id: number; status: string }[],
          error: null,
        }),
    supabase.rpc('get_frekwencja_zawodnikow', { p_druzyna_id: druzynaId }),
  ]);

  const error = zawodnicyRes.error;
  const zawodnicy = (zawodnicyRes.data ?? []) as Zawodnik[];

  const statusMap = new Map<number, Map<number, string>>();
  for (const o of obecnosciRes.data ?? []) {
    if (!statusMap.has(o.zawodnik_id)) statusMap.set(o.zawodnik_id, new Map());
    statusMap.get(o.zawodnik_id)!.set(o.trening_id, o.status);
  }

  const dotsMap = new Map<number, string[]>();
  zawodnicy.forEach((z) => {
    const m = statusMap.get(z.id);
    dotsMap.set(
      z.id,
      last5.map((t) => m?.get(t.id) ?? 'brak')
    );
  });

  const frekwencjaMap = new Map<number, { obecni: number; total: number }>();
  for (const row of (frekwencjaRes.data ?? []) as {
    zawodnik_id: number;
    obecni: number;
    total: number;
  }[]) {
    frekwencjaMap.set(row.zawodnik_id, {
      obecni: Number(row.obecni),
      total: Number(row.total),
    });
  }

  const inicjaly = (imie: string, nazwisko: string) => {
    return `${imie.charAt(0)}${nazwisko.charAt(0)}`.toUpperCase();
  };

  const posortowani = [...zawodnicy].sort((a, b) => {
    if (sort === 'alpha') {
      const cmp = a.nazwisko.localeCompare(b.nazwisko, 'pl');
      if (cmp !== 0) return cmp;
      return a.imie.localeCompare(b.imie, 'pl');
    }
    if (sort === 'rocznik') {
      const ra = a.rocznik ?? 0;
      const rb = b.rocznik ?? 0;
      if (rb !== ra) return rb - ra;
      return a.nazwisko.localeCompare(b.nazwisko, 'pl');
    }
    if (sort === 'frekwencja') {
      const sa = frekwencjaMap.get(a.id) ?? { obecni: 0, total: 0 };
      const sb = frekwencjaMap.get(b.id) ?? { obecni: 0, total: 0 };
      const pa = sa.total > 0 ? sa.obecni / sa.total : 0;
      const pb = sb.total > 0 ? sb.obecni / sb.total : 0;
      if (pb !== pa) return pb - pa;
      return a.nazwisko.localeCompare(b.nazwisko, 'pl');
    }
    const na = a.numer ?? 9999;
    const nb = b.numer ?? 9999;
    if (na !== nb) return na - nb;
    return a.nazwisko.localeCompare(b.nazwisko, 'pl');
  });

  const liczba = posortowani.length;

  const buildSortUrl = (key: SortKey) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (key !== 'alpha') p.set('sort', key);
    const qs = p.toString();
    return qs ? `/kadra?${qs}` : '/kadra';
  };

  return (
    <div className="max-w-3xl md:max-w-5xl mx-auto">
      <header className="mb-3 md:mb-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <PageHeaderLogo icon={Users} logoUrl={activeDruzyna?.logo_url ?? null} />
            <div>
              <h1 className="text-sm md:text-2xl font-bold leading-tight text-white drop-shadow-lg tracking-wide">
                LISTA ZAWODNIKÓW
              </h1>
              <p className="text-[10px] md:text-xs text-white/60 font-medium md:mt-0.5">
                {liczba} {liczba === 1 ? 'zawodnik' : 'zawodników'} na liście
              </p>
            </div>
          </div>
          <TopBar />
        </div>

        <div className="flex gap-2">
          <form action="/kadra" method="GET" className="relative flex-1 min-w-0">
            {sort !== 'alpha' && <input type="hidden" name="sort" value={sort} />}
            <Search className="absolute left-2.5 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
            <input
              name="q"
              type="text"
              defaultValue={q}
              placeholder="Szukaj zawodnika..."
              className="w-full bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-lg md:rounded-2xl pl-8 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 text-xs md:text-sm text-white placeholder:text-white/40 outline-none focus:border-green-400/50 transition-all"
            />
          </form>
          <Link
            href="/zawodnicy/import"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-2xl bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 hover:border-green-400/50 text-green-300 hover:text-green-200 text-xs md:text-sm font-semibold transition-all flex-shrink-0"
            title="Import z Excela"
          >
            <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Import</span>
          </Link>
        </div>
      </header>

      <div className="mb-3 md:mb-5 animate-fadeIn">
        <div className="flex items-center gap-2 mb-1.5 md:mb-2">
          <ArrowUpDown className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/40" />
          <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest">
            Sortuj
          </span>
        </div>
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 -mx-3 px-3 md:mx-0 md:px-0">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => {
            const active = sort === key;
            return (
              <Link
                key={key}
                href={buildSortUrl(key)}
                className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full border text-[11px] md:text-xs font-semibold transition-all ${
                  active
                    ? 'bg-green-500/15 border-green-400/50 text-green-400'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {SORT_LABELS[key]}
              </Link>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-3 mb-3 text-xs animate-fadeIn text-red-200">
          Błąd: {error.message}
        </div>
      )}

      {liczba === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-1 md:space-y-2 list-none p-0 m-0">
          {posortowani.map((z: Zawodnik, i: number) => {
            const dots = dotsMap.get(z.id) ?? [];
            return (
              <li key={z.id} className={`group animate-fadeIn stagger-${Math.min(i + 1, 8)}`}>
                <Link
                  href={`/zawodnicy/${z.id}`}
                  className="flex items-center gap-2.5 md:gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-lg md:rounded-2xl px-2.5 md:px-4 py-2 md:py-3 hover:bg-slate-900 transition-all active:scale-[0.99]"
                >
                  <div className="w-6 md:w-8 text-center flex-shrink-0">
                    <span className="text-[11px] md:text-sm font-bold text-white/40 tabular-nums">
                      {i + 1}.
                    </span>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-md md:rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-white/70 text-[11px] md:text-base">
                      {inicjaly(z.imie, z.nazwisko)}
                    </div>
                    {z.numer != null && (
                      <div className="absolute -bottom-1 -right-1.5 md:-bottom-1.5 md:-right-2 px-1 md:px-1.5 py-[1px] md:py-0.5 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200/60 text-slate-900 text-[8px] md:text-[10px] font-black leading-none shadow-lg shadow-amber-500/40 tabular-nums">
                        #{z.numer}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm md:text-base truncate leading-tight">
                      {z.imie} {z.nazwisko}
                    </div>
                    <div className="text-[10px] md:text-xs text-white/40 leading-tight truncate md:mt-0.5">
                      {z.rocznik ?? '-'}
                      {z.pozycja ? ` · ${z.pozycja}` : ''}
                    </div>
                  </div>

                  {dots.length > 0 && (
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                      {dots.map((status, idx) => {
                        const wydarzenie = last5[idx];
                        const dataStr = wydarzenie
                          ? new Date(wydarzenie.data + 'T00:00:00').toLocaleDateString('pl-PL', {
                              day: '2-digit',
                              month: '2-digit',
                            })
                          : '';
                        const title = wydarzenie
                          ? `${dataStr} · ${wydarzenie.typ} - ${labelStatusu(status)}`
                          : labelStatusu(status);

                        const hideOnMobile = idx >= 3;

                        return (
                          <span
                            key={idx}
                            title={title}
                            aria-label={title}
                            className={`${
                              hideOnMobile ? 'hidden sm:block' : 'block'
                            } w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full ${kolorKropki(
                              status
                            )} ring-1 ring-black/30`}
                          />
                        );
                      })}
                    </div>
                  )}

                  <span className="text-white/30 text-base md:text-xl flex-shrink-0 leading-none">
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/zawodnicy/nowy"
        className="group fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center justify-center text-white shadow-2xl shadow-green-500/50 hover:shadow-green-400/70 transition-all hover:scale-110 active:scale-95 animate-glow"
        title="Dodaj zawodnika"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
      <div className="relative">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-4 md:mb-5">
          <Users className="w-8 h-8 md:w-10 md:h-10 text-green-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-bold text-base md:text-xl mb-1 md:mb-2 text-white drop-shadow">
          Zacznijmy od składu
        </h3>
        <p className="text-xs md:text-sm text-white/60 mb-5 md:mb-6 max-w-xs mx-auto">
          Dodaj pierwszego zawodnika, żeby zarządzać drużyną, treningami i frekwencją.
        </p>
        <Link
          href="/zawodnicy/nowy"
          className="group inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm transition-all hover:shadow-lg hover:shadow-green-500/40"
        >
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform" />
          Dodaj pierwszego zawodnika
        </Link>
      </div>
    </div>
  );
}