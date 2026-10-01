import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { TopBar } from '@/components/TopBar';
import { MiesiacDropdown } from '@/components/MiesiacDropdown';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Trophy,
} from 'lucide-react';

const pad2 = (n: number) => String(n).padStart(2, '0');
const toISO = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

type Zakres = { od: string; do: string; label: string; typ: string };

function getZakres(okres: string, m?: string): Zakres {
  const dzis = new Date();
  const rok = dzis.getFullYear();
  const miesiac = dzis.getMonth();

  if (okres === '30dni') {
    const od = new Date(dzis);
    od.setDate(od.getDate() - 30);
    return { od: toISO(od), do: toISO(dzis), label: 'Ostatnie 30 dni', typ: '30dni' };
  }

  if (okres === '3mies') {
    const od = new Date(dzis);
    od.setDate(od.getDate() - 90);
    return { od: toISO(od), do: toISO(dzis), label: 'Ostatnie 3 miesiące', typ: '3mies' };
  }

  if (okres === 'sezon') {
    const rokStart = miesiac >= 8 ? rok : rok - 1;
    const od = new Date(rokStart, 8, 1);
    const do_ = new Date(rokStart + 1, 5, 30);
    return {
      od: toISO(od),
      do: toISO(do_),
      label: `Sezon ${rokStart}/${String(rokStart + 1).slice(2)}`,
      typ: 'sezon',
    };
  }

  if (okres === 'month' && m && /^\d{4}-\d{2}$/.test(m)) {
    const [rr, mm] = m.split('-').map(Number);
    const od = new Date(rr, mm - 1, 1);
    const do_ = new Date(rr, mm, 0);
    const nazwa = od.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    return {
      od: toISO(od),
      do: toISO(do_),
      label: nazwa.charAt(0).toUpperCase() + nazwa.slice(1),
      typ: 'month',
    };
  }

  return { od: '1900-01-01', do: '2100-12-31', label: 'Cały okres', typ: 'all' };
}

function formatMiesiac(iso: string): string {
  const [rr, mm] = iso.split('-').map(Number);
  const d = new Date(rr, mm - 1, 1);
  const nazwa = d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  return nazwa.charAt(0).toUpperCase() + nazwa.slice(1);
}

function formatZakres(od: string, do_: string): string {
  const d1 = new Date(od + 'T00:00:00');
  const d2 = new Date(do_ + 'T00:00:00');
  return `${pad2(d1.getDate())}.${pad2(d1.getMonth() + 1)}.${d1.getFullYear()} — ${pad2(d2.getDate())}.${pad2(d2.getMonth() + 1)}.${d2.getFullYear()}`;
}

function ostatnie6Miesiecy(koniec: Date) {
  const out: { iso: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(koniec.getFullYear(), koniec.getMonth() - i, 1);
    const iso = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    const label = d.toLocaleDateString('pl-PL', { month: 'short' }).replace('.', '');
    out.push({ iso, label: label.charAt(0).toUpperCase() + label.slice(1, 3) });
  }
  return out;
}

export default async function Statystyki({
  searchParams,
}: {
  searchParams: Promise<{ okres?: string; m?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const dzis = new Date();
  const biezacyMiesiac = `${dzis.getFullYear()}-${pad2(dzis.getMonth() + 1)}`;
  const okres = params.okres ?? 'month';
  const m = params.m ?? (okres === 'month' ? biezacyMiesiac : undefined);
  const sort = params.sort ?? 'obecnosci';

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const { data: wszystkieTreningi } = await supabase
    .from('treningi')
    .select('id, data, typ')
    .eq('druzyna_id', druzynaId);

  const wszystkieIds = (wszystkieTreningi ?? []).map((t) => t.id);

  const { data: zawodnicy } = await supabase
    .from('zawodnicy')
    .select('id, imie, nazwisko, numer')
    .eq('druzyna_id', druzynaId)
    .order('nazwisko', { ascending: true });

  const { data: wszystkieObecnosci } =
    wszystkieIds.length > 0
      ? await supabase
          .from('obecnosc')
          .select('trening_id, zawodnik_id, status')
          .in('trening_id', wszystkieIds)
      : { data: [] };

  const unikalneMiesiace = Array.from(
    new Set((wszystkieTreningi ?? []).map((t) => t.data.slice(0, 7)))
  )
    .sort()
    .reverse();

  const zakres = getZakres(okres, m);

  const treningiZakres = (wszystkieTreningi ?? []).filter(
    (t) => t.data >= zakres.od && t.data <= zakres.do
  );
  const idsZakres = new Set(treningiZakres.map((t) => t.id));

  const obecnosciZakres = (wszystkieObecnosci ?? []).filter((o) =>
    idsZakres.has(o.trening_id)
  );

  const totalTreningi = treningiZakres.length;
  const totalZawodnicy = (zawodnicy ?? []).length;
  const totalWpisy = obecnosciZakres.length;

  // ── Rozbicie statusów (tylko obecny/nieobecny w UI) ──
  const obecniRazem = obecnosciZakres.filter(
    (o) => o.status === 'obecny' || o.status === 'spozniony'
  ).length;
  const nieobecniRazem = totalWpisy - obecniRazem;
  const procentOgolem =
    totalWpisy > 0 ? Math.round((obecniRazem / totalWpisy) * 100) : 0;

  // ── Ranking ──
  const ranking = (zawodnicy ?? [])
    .map((z) => {
      const wpisy = obecnosciZakres.filter((o) => o.zawodnik_id === z.id);
      const obecn = wpisy.filter(
        (w) => w.status === 'obecny' || w.status === 'spozniony'
      ).length;
      const procent = wpisy.length > 0 ? Math.round((obecn / wpisy.length) * 100) : 0;
      return { ...z, obecnosci: obecn, wpisy: wpisy.length, procent };
    })
    .filter((r) => r.wpisy > 0);

  const rankingSort = [...ranking].sort((a, b) => {
    if (sort === 'procent') {
      if (b.procent !== a.procent) return b.procent - a.procent;
      return b.obecnosci - a.obecnosci;
    }
    if (sort === 'nazwisko') {
      return a.nazwisko.localeCompare(b.nazwisko, 'pl');
    }
    if (b.obecnosci !== a.obecnosci) return b.obecnosci - a.obecnosci;
    return b.procent - a.procent;
  });

  const doPoprawy = ranking
    .filter((r) => r.procent < 70)
    .sort((a, b) => a.procent - b.procent);

  // ── Wykres 6 miesięcy ──
  const koniecZakresu = new Date(zakres.do + 'T00:00:00');
  const miesiaceWykres = ostatnie6Miesiecy(koniecZakresu).map(({ iso, label }) => {
    const treningiMies = (wszystkieTreningi ?? []).filter((t) =>
      t.data.startsWith(iso)
    );
    const idsMies = new Set(treningiMies.map((t) => t.id));
    const obMies = (wszystkieObecnosci ?? []).filter((o) =>
      idsMies.has(o.trening_id)
    );
    const obecniMies = obMies.filter(
      (o) => o.status === 'obecny' || o.status === 'spozniony'
    ).length;
    const procent =
      obMies.length > 0 ? Math.round((obecniMies / obMies.length) * 100) : null;
    return { iso, label, procent, treningi: treningiMies.length };
  });

  const najlepszy = miesiaceWykres
    .filter((mm) => mm.procent !== null)
    .sort((a, b) => (b.procent ?? 0) - (a.procent ?? 0))[0];

  // ── Dane do dropdownu miesięcy ──
  const miesiaceDropdown = unikalneMiesiace.map((mm) => {
    const treningiMies = (wszystkieTreningi ?? []).filter((t) =>
      t.data.startsWith(mm)
    );
    const idsMies = new Set(treningiMies.map((t) => t.id));
    const obMies = (wszystkieObecnosci ?? []).filter((o) =>
      idsMies.has(o.trening_id)
    );
    const obecniMies = obMies.filter(
      (o) => o.status === 'obecny' || o.status === 'spozniony'
    ).length;
    const procent =
      obMies.length > 0 ? Math.round((obecniMies / obMies.length) * 100) : 0;
    return {
      iso: mm,
      label: formatMiesiac(mm),
      treningi: treningiMies.length,
      procent,
    };
  });

  // ── URL helpery ──
  const okresUrl = (o: string, mm?: string) => {
    const p = new URLSearchParams();
    p.set('okres', o);
    if (mm) p.set('m', mm);
    if (sort !== 'obecnosci') p.set('sort', sort);
    return `/statystyki?${p.toString()}`;
  };

  const sortUrl = (s: string) => {
    const p = new URLSearchParams();
    p.set('okres', okres);
    if (m) p.set('m', m);
    if (s !== 'obecnosci') p.set('sort', s);
    return `/statystyki?${p.toString()}`;
  };

  const PRESETY = [
    { key: '30dni', label: 'Ostatnie 30 dni' },
    { key: '3mies', label: 'Ostatnie 3 miesiące' },
    { key: 'sezon', label: 'Ten sezon' },
    { key: 'all', label: 'Cały okres' },
  ];

  const liczbaDoPoprawy = doPoprawy.length;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 lg:p-8 pb-28">
        <div className="max-w-screen-2xl mx-auto">
          <header className="mb-6 flex items-center gap-3 animate-fadeIn">
            <Link
              href="/kadra"
              className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold leading-tight text-white drop-shadow-lg">
                  Statystyki
                </h1>
                <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
                  Frekwencja drużyny
                </p>
              </div>
            </div>
            <TopBar />
          </header>

          {/* FILTR OKRESU */}
          <div className="mb-5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 md:p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-shrink-0">
                <CalendarIcon className="w-4 h-4 text-white/50" />
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
                  Okres
                </span>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {PRESETY.map((p) => {
                  const active = zakres.typ === p.key;
                  return (
                    <Link
                      key={p.key}
                      href={okresUrl(p.key)}
                      className={`px-3 md:px-4 py-2 rounded-xl border text-xs md:text-sm font-semibold transition-all ${
                        active
                          ? 'bg-green-500/15 border-green-400/50 text-green-400'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/25'
                      }`}
                    >
                      {p.label}
                    </Link>
                  );
                })}

<MiesiacDropdown
  miesiace={miesiaceDropdown}
  aktywny={zakres.typ === 'month' ? m ?? null : null}
  sort={sort}
/>
              </div>

              <div className="ml-auto flex items-center gap-2 text-xs text-white/50">
                <span>
                  Zakres:{' '}
                  <span className="text-white/80 font-semibold">
                    {formatZakres(zakres.od, zakres.do)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
            <div className="rounded-2xl p-5 bg-gradient-to-br from-green-500/20 to-green-700/10 border border-green-400/30 shadow-lg shadow-black/30">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-400/40 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-400" strokeWidth={2.5} />
              </div>
              <div className="text-4xl md:text-5xl font-black text-white leading-none">
                {procentOgolem}
                <span className="text-2xl text-white/60">%</span>
              </div>
              <div className="text-xs md:text-sm font-bold text-white/80 mt-2 uppercase tracking-wider">
                Frekwencja
              </div>
              <div className="text-[10px] md:text-xs text-white/50 mt-1 leading-tight">
                {zakres.label} ·{' '}
                <span className="text-white/70">{totalWpisy} wpisów</span>
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-500/20 to-blue-700/10 border border-blue-400/30 shadow-lg shadow-black/30">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mb-3">
                <CalendarIcon className="w-5 h-5 text-blue-400" strokeWidth={2.5} />
              </div>
              <div className="text-4xl md:text-5xl font-black text-white leading-none">
                {totalTreningi}
              </div>
              <div className="text-xs md:text-sm font-bold text-white/80 mt-2 uppercase tracking-wider">
                Treningi
              </div>
              <div className="text-[10px] md:text-xs text-white/50 mt-1 leading-tight">
                {zakres.label}
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-500/20 to-purple-700/10 border border-purple-400/30 shadow-lg shadow-black/30">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-purple-400" strokeWidth={2.5} />
              </div>
              <div className="text-4xl md:text-5xl font-black text-white leading-none">
                {totalZawodnicy}
              </div>
              <div className="text-xs md:text-sm font-bold text-white/80 mt-2 uppercase tracking-wider">
                Zawodnicy
              </div>
              <div className="text-[10px] md:text-xs text-white/50 mt-1 leading-tight">
                W drużynie
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-gradient-to-br from-red-500/20 to-red-700/10 border border-red-400/30 shadow-lg shadow-black/30">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={2.5} />
              </div>
              <div className="text-4xl md:text-5xl font-black text-white leading-none">
                {liczbaDoPoprawy}
              </div>
              <div className="text-xs md:text-sm font-bold text-white/80 mt-2 uppercase tracking-wider">
                Do poprawy
              </div>
              <div className="text-[10px] md:text-xs text-white/50 mt-1 leading-tight">
                Frekwencja poniżej 70%
              </div>
            </div>
          </div>

          {/* GŁÓWNY GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Wykres 6 miesięcy */}
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl shadow-black/60">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <h3 className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">
                        Frekwencja — ostatnie 6 miesięcy
                      </h3>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed max-w-xl">
                      Średnia frekwencja z każdego miesiąca. Miesiące bez treningów są pomijane.
                    </p>
                  </div>
                  {najlepszy && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                        Najlepszy
                      </div>
                      <div className="text-sm md:text-base font-bold text-green-400">
                        {formatMiesiac(najlepszy.iso).split(' ')[0]} · {najlepszy.procent}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative h-56 pl-12 pr-2 pb-8">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pl-12">
                    {[100, 75, 50, 25, 0].map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30 w-8 text-right">
                          {v}%
                        </span>
                        <div
                          className={`flex-1 border-t ${
                            v === 0
                              ? 'border-white/10'
                              : 'border-dashed border-white/5'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="relative h-full flex items-end gap-2 md:gap-3 pl-12 pr-2 pb-6">
                    {miesiaceWykres.map((mm) => {
                      const isEmpty = mm.procent === null;
                      const isSelected = zakres.typ === 'month' && m === mm.iso;
                      return (
                        <div
                          key={mm.iso}
                          className="flex-1 flex flex-col items-center justify-end h-full relative group"
                        >
                          {!isEmpty && (
                            <div className="absolute -top-0 left-1/2 -translate-x-1/2 text-sm font-bold text-white whitespace-nowrap mb-1">
                              {mm.procent}%
                            </div>
                          )}
                          <div
                            className={`w-full rounded-t-xl transition-all ${
                              isEmpty
                                ? 'bg-slate-700/40 h-1'
                                : isSelected
                                ? 'bg-gradient-to-t from-green-700 to-green-400 shadow-lg shadow-green-500/50 ring-2 ring-green-400/60'
                                : 'bg-gradient-to-t from-green-700 to-green-400 shadow-lg shadow-green-500/30'
                            }`}
                            style={
                              isEmpty ? undefined : { height: `${mm.procent}%` }
                            }
                          />
                          <div
                            className={`absolute bottom-0 text-[10px] font-semibold uppercase tracking-wider ${
                              isSelected
                                ? 'text-green-400 font-bold'
                                : isEmpty
                                ? 'text-white/30'
                                : 'text-white/60'
                            }`}
                          >
                            {mm.label}
                          </div>
                          {isEmpty && (
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/20 rounded-lg px-2 py-1 text-[10px] whitespace-nowrap transition-opacity z-10">
                              Brak treningów
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-green-400 font-bold uppercase tracking-wider">
                              Wybrany
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] md:text-xs text-white/50 flex-wrap gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-gradient-to-t from-green-700 to-green-400" />
                    Miesiące z treningami
                  </span>
                  {zakres.typ === 'month' && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-green-400 ring-1 ring-green-400/60" />
                      Wybrany miesiąc
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-slate-700/60" />
                    Brak danych
                  </span>
                </div>
              </div>

              {/* Rozkład obecności — tylko 2 kategorie */}
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl shadow-black/60">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
                  <h3 className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">
                    Rozkład obecności
                  </h3>
                </div>
                <p className="text-xs text-white/50 mb-5">
                  Wszystkie wpisy z <strong className="text-white/70">{zakres.label}</strong>{' '}
                  ({totalWpisy} wpisów z {totalTreningi} treningów)
                </p>

                {totalWpisy === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-7 h-7 text-white/40" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-white/60">Brak danych w tym okresie</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 md:gap-8 flex-wrap">
                    <div className="relative flex-shrink-0">
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="65"
                          fill="none"
                          stroke="rgba(148, 163, 184, 0.15)"
                          strokeWidth="22"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="65"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="22"
                          strokeDasharray={`${(obecniRazem / totalWpisy) * 408} 408`}
                          transform="rotate(-90 80 80)"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="65"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="22"
                          strokeDasharray={`${(nieobecniRazem / totalWpisy) * 408} 408`}
                          strokeDashoffset={-((obecniRazem / totalWpisy) * 408)}
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-black text-white leading-none">
                          {procentOgolem}%
                        </div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
                          Frekwencja
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[240px] grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <RozkladKarta
                        label="Obecny"
                        count={obecniRazem}
                        total={totalWpisy}
                        variant="green"
                        icon={CheckCircle2}
                      />
                      <RozkladKarta
                        label="Nieobecny"
                        count={nieobecniRazem}
                        total={totalWpisy}
                        variant="red"
                        icon={XCircle}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PRAWA KOLUMNA */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-2xl shadow-black/60">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-400" strokeWidth={2.5} />
                      <h3 className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">
                        Ranking zawodników
                      </h3>
                    </div>
                    <p className="text-xs text-white/50">
                      {zakres.label} · {ranking.length}{' '}
                      {ranking.length === 1 ? 'zawodnik' : 'zawodników'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">
                    Sortuj:
                  </span>
                  <Link
                    href={sortUrl('obecnosci')}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      sort === 'obecnosci'
                        ? 'bg-green-500/15 border-green-400/50 text-green-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Liczba obecności
                  </Link>
                  <Link
                    href={sortUrl('procent')}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      sort === 'procent'
                        ? 'bg-green-500/15 border-green-400/50 text-green-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Frekwencja
                  </Link>
                  <Link
                    href={sortUrl('nazwisko')}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      sort === 'nazwisko'
                        ? 'bg-green-500/15 border-green-400/50 text-green-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Nazwisko
                  </Link>
                </div>

                {rankingSort.length === 0 ? (
                  <div className="text-center py-8 text-sm text-white/40">
                    Brak danych w tym okresie
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {rankingSort.map((r, i) => {
                      const medal =
                        i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                      const colorClass =
                        r.procent >= 80
                          ? 'text-green-400'
                          : r.procent >= 60
                          ? 'text-amber-400'
                          : 'text-red-400';
                      const medalBg =
                        r.procent >= 80
                          ? 'bg-yellow-500/20 border-yellow-400/40'
                          : r.procent >= 60
                          ? 'bg-amber-500/20 border-amber-400/40'
                          : 'bg-red-500/20 border-red-400/40';
                      return (
                        <li
                          key={r.id}
                          className="flex items-center gap-3 py-2.5 px-2.5 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base flex-shrink-0 ${medalBg}`}
                          >
                            {medal ?? (
                              <span className="text-xs font-bold text-white/70">
                                {i + 1}
                              </span>
                            )}
                          </div>
                          <Link href={`/zawodnicy/${r.id}`} className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {r.imie} {r.nazwisko}
                            </div>
                            <div className="text-[10px] text-white/50">
                              {r.obecnosci} z {r.wpisy}{' '}
                              {r.wpisy === 1 ? 'treningu' : 'treningów'}
                            </div>
                          </Link>
                          <div className="text-right flex-shrink-0">
                            <div
                              className={`text-sm font-black leading-none ${colorClass}`}
                            >
                              {r.obecnosci}
                            </div>
                            <div className="text-[10px] text-white/40 mt-0.5">
                              {r.procent}%
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {doPoprawy.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-2xl shadow-black/60">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={2.5} />
                    <h3 className="text-xs font-bold text-red-400/90 uppercase tracking-widest">
                      Wymaga uwagi
                    </h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">
                    Frekwencja poniżej 70% w{' '}
                    <strong className="text-white/70">{zakres.label}</strong>
                  </p>
                  <ul className="space-y-2">
                    {doPoprawy.slice(0, 5).map((r) => {
                      const inicjaly = `${r.imie.charAt(0)}${r.nazwisko.charAt(0)}`.toUpperCase();
                      const colorClass =
                        r.procent >= 60 ? 'text-amber-400' : 'text-red-400';
                      return (
                        <li
                          key={r.id}
                          className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg bg-red-500/5 border border-red-400/15"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-700 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/70 flex-shrink-0">
                            {inicjaly}
                          </div>
                          <Link href={`/zawodnicy/${r.id}`} className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {r.imie} {r.nazwisko}
                            </div>
                            <div className="text-[10px] text-white/50">
                              {r.obecnosci} z {r.wpisy}{' '}
                              {r.wpisy === 1 ? 'treningu' : 'treningów'}
                            </div>
                          </Link>
                          <div className={`text-sm font-black ${colorClass}`}>
                            {r.procent}%
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function RozkladKarta({
  label,
  count,
  total,
  variant,
  icon: Icon,
}: {
  label: string;
  count: number;
  total: number;
  variant: 'green' | 'red';
  icon: any;
}) {
  const colors = {
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-400/30',
      iconBg: 'bg-green-500/20 border-green-400/40',
      iconColor: 'text-green-400',
      text: 'text-green-400',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-400/30',
      iconBg: 'bg-red-500/20 border-red-400/40',
      iconColor: 'text-red-400',
      text: 'text-red-400',
    },
  }[variant];

  const procent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      className={`flex items-center gap-3 ${colors.bg} border ${colors.border} rounded-2xl p-3`}
    >
      <div
        className={`w-11 h-11 rounded-xl ${colors.iconBg} border flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-5 h-5 ${colors.iconColor}`} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-2xl font-black leading-none ${
            count > 0 ? 'text-white' : 'text-white/60'
          }`}
        >
          {count}
        </div>
        <div className={`text-xs ${colors.text} font-semibold mt-0.5`}>{label}</div>
        <div className="text-[10px] text-white/40 mt-0.5">{procent}% wpisów</div>
      </div>
    </div>
  );
}