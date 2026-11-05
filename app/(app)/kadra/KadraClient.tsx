'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { Users, Plus, Search, ArrowUpDown, Upload, ChevronRight } from 'lucide-react';

type Zawodnik = { id: number; imie: string; nazwisko: string; rocznik: number | null; pozycja: string | null; numer: number | null; kontakt_rodzica: string | null; notatki: string | null; };
type SortKey = 'alpha' | 'rocznik' | 'frekwencja' | 'numer';

const SORT_LABELS: Record<SortKey, string> = { alpha: 'Alfabetycznie', rocznik: 'Rocznik', frekwencja: 'Frekwencja', numer: 'Numer' };

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

export function KadraClient({ 
  zawodnicy, last5, obecnosci, frekwencja, logoUrl, topBar 
}: { 
  zawodnicy: Zawodnik[]; 
  last5: any[]; 
  obecnosci: any[]; 
  frekwencja: any[]; 
  logoUrl: string | null;
  topBar: React.ReactNode; // <-- DODANO PROP
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('alpha');

  const statusMap = useMemo(() => {
    const map = new Map<number, Map<number, string>>();
    for (const o of obecnosci) {
      if (!map.has(o.zawodnik_id)) map.set(o.zawodnik_id, new Map());
      map.get(o.zawodnik_id)!.set(o.trening_id, o.status);
    }
    return map;
  }, [obecnosci]);

  const dotsMap = useMemo(() => {
    const map = new Map<number, string[]>();
    zawodnicy.forEach((z) => {
      const m = statusMap.get(z.id);
      map.set(z.id, last5.map((t) => m?.get(t.id) ?? 'brak'));
    });
    return map;
  }, [zawodnicy, last5, statusMap]);

  const frekwencjaMap = useMemo(() => {
    const map = new Map<number, { obecni: number; total: number }>();
    for (const row of frekwencja) {
      map.set(row.zawodnik_id, { obecni: Number(row.obecni), total: Number(row.total) });
    }
    return map;
  }, [frekwencja]);

  const inicjaly = (imie: string, nazwisko: string) => `${imie.charAt(0)}${nazwisko.charAt(0)}`.toUpperCase();

  const filteredAndSorted = useMemo(() => {
    let list = [...zawodnicy];
    
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(z => 
        z.imie.toLowerCase().includes(q) || 
        z.nazwisko.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      if (sort === 'alpha') return a.nazwisko.localeCompare(b.nazwisko, 'pl') || a.imie.localeCompare(b.imie, 'pl');
      if (sort === 'rocznik') { const ra = a.rocznik ?? 0; const rb = b.rocznik ?? 0; return rb - ra || a.nazwisko.localeCompare(b.nazwisko, 'pl'); }
      if (sort === 'frekwencja') {
        const sa = frekwencjaMap.get(a.id) ?? { obecni: 0, total: 0 };
        const sb = frekwencjaMap.get(b.id) ?? { obecni: 0, total: 0 };
        const pa = sa.total > 0 ? sa.obecni / sa.total : 0;
        const pb = sb.total > 0 ? sb.obecni / sb.total : 0;
        return pb - pa || a.nazwisko.localeCompare(b.nazwisko, 'pl');
      }
      const na = a.numer ?? 9999; const nb = b.numer ?? 9999;
      return na - nb || a.nazwisko.localeCompare(b.nazwisko, 'pl');
    });
  }, [zawodnicy, search, sort, frekwencjaMap]);

  const liczba = filteredAndSorted.length;

  return (
    <div className="max-w-3xl md:max-w-5xl mx-auto">
      <header className="mb-3 md:mb-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <PageHeaderLogo icon={Users} logoUrl={logoUrl} />
            <div>
              <h1 className="text-sm md:text-2xl font-bold leading-tight text-white drop-shadow-lg tracking-wide">LISTA ZAWODNIKÓW</h1>
              <p className="text-[10px] md:text-xs text-white/60 font-medium md:mt-0.5">{liczba} {liczba === 1 ? 'zawodnik' : 'zawodników'} na liście</p>
            </div>
          </div>
          {topBar} {/* <-- UŻYCIE PROPA ZAMIAST <TopBar /> */}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj zawodnika..."
              className="w-full bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-lg md:rounded-2xl pl-8 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 text-white placeholder:text-white/40 outline-none focus:border-green-400/50 transition-all text-base md:text-sm"
            />
          </div>
          <Link href="/zawodnicy/import" className="inline-flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-2xl bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 hover:border-green-400/50 text-green-300 hover:text-green-200 text-xs md:text-sm font-semibold transition-all flex-shrink-0" title="Import z Excela">
            <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Import</span>
          </Link>
        </div>
      </header>

      <div className="mb-3 md:mb-5 animate-fadeIn">
        <div className="flex items-center gap-2 mb-1.5 md:mb-2">
          <ArrowUpDown className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/40" />
          <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest">Sortuj</span>
        </div>
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 -mx-3 px-3 md:mx-0 md:px-0">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => {
            const active = sort === key;
            return (
              <button key={key} onClick={() => setSort(key)} className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full border text-[11px] md:text-xs font-semibold transition-all ${active ? 'bg-green-500/15 border-green-400/50 text-green-400' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}`}>
                {SORT_LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>

      {liczba === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-4 md:mb-5"><Users className="w-8 h-8 md:w-10 md:h-10 text-green-400" strokeWidth={1.5} /></div>
            <h3 className="font-bold text-base md:text-xl mb-1 md:mb-2 text-white drop-shadow">Brak wyników</h3>
            <p className="text-xs md:text-sm text-white/60 mb-5 md:mb-6 max-w-xs mx-auto">{search ? 'Nie znaleziono zawodnika o podanych kryteriach.' : 'Zacznijmy od składu. Dodaj pierwszego zawodnika.'}</p>
            {!search && <Link href="/zawodnicy/nowy" className="group inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm transition-all hover:shadow-lg hover:shadow-green-500/40"><Plus className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform" /> Dodaj pierwszego zawodnika</Link>}
          </div>
        </div>
      ) : (
        <ul className="space-y-1 md:space-y-2 list-none p-0 m-0">
          {filteredAndSorted.map((z: Zawodnik, i: number) => {
            const dots = dotsMap.get(z.id) ?? [];
            return (
              <li key={z.id} className={`group animate-fadeIn stagger-${Math.min(i + 1, 8)}`}>
                <Link href={`/zawodnicy/${z.id}`} className="flex items-center gap-2.5 md:gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-lg md:rounded-2xl px-2.5 md:px-4 py-2 md:py-3 hover:bg-slate-900 transition-all active:scale-[0.99]">
                  <div className="w-6 md:w-8 text-center flex-shrink-0"><span className="text-[11px] md:text-sm font-bold text-white/40 tabular-nums">{i + 1}.</span></div>
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-md md:rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-white/70 text-[11px] md:text-base">{inicjaly(z.imie, z.nazwisko)}</div>
                    {z.numer != null && <div className="absolute -bottom-1 -right-1.5 md:-bottom-1.5 md:-right-2 px-1 md:px-1.5 py-[1px] md:py-0.5 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200/60 text-slate-900 text-[8px] md:text-[10px] font-black leading-none shadow-lg shadow-amber-500/40 tabular-nums">#{z.numer}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm md:text-base truncate leading-tight">{z.imie} {z.nazwisko}</div>
                    <div className="text-[10px] md:text-xs text-white/40 leading-tight truncate md:mt-0.5">{z.rocznik ?? '-'}{z.pozycja ? ` · ${z.pozycja}` : ''}</div>
                  </div>
                  {dots.length > 0 && (
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                      {dots.map((status: string, idx: number) => {
                        const wydarzenie = last5[idx];
                        const dataStr = wydarzenie ? new Date(wydarzenie.data + 'T00:00:00').toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }) : '';
                        const title = wydarzenie ? `${dataStr} · ${wydarzenie.typ} - ${labelStatusu(status)}` : labelStatusu(status);
                        const hideOnMobile = idx >= 3;
                        return <span key={idx} title={title} aria-label={title} className={`${hideOnMobile ? 'hidden sm:block' : 'block'} w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full ${kolorKropki(status)} ring-1 ring-black/30`} />;
                      })}
                    </div>
                  )}
                  <span className="text-white/30 text-base md:text-xl flex-shrink-0 leading-none"><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link href="/zawodnicy/nowy" className="group fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center justify-center text-white shadow-2xl shadow-green-500/50 hover:shadow-green-400/70 transition-all hover:scale-110 active:scale-95" title="Dodaj zawodnika">
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" strokeWidth={2.5} />
      </Link>
    </div>
  );
}