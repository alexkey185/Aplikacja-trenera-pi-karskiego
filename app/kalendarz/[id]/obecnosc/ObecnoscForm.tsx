'use client';

import { useState, useMemo, useEffect } from 'react';
import { zapiszObecnosc } from './actions';
import { Check, X, Save, TrendingUp, Info } from 'lucide-react';

type Zawodnik = {
  id: number;
  imie: string;
  nazwisko: string;
  numer: number | null;
  pozycja: string | null;
};

const opcje = [
  {
    value: 'obecny',
    icon: Check,
    title: 'Obecny',
    color: 'text-green-400',
    bgActive:
      'bg-gradient-to-br from-green-500 to-green-700 border-green-400 shadow-lg shadow-green-900/50',
  },
  {
    value: 'nieobecny',
    icon: X,
    title: 'Nieobecny',
    color: 'text-red-400',
    bgActive:
      'bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-lg shadow-red-900/50',
  },
];

export function ObecnoscForm({
  treningId,
  zawodnicy,
  initialStatus,
  previousStatus = {},
  typTreningu,
}: {
  treningId: number;
  zawodnicy: Zawodnik[];
  initialStatus: Record<number, string>;
  previousStatus?: Record<number, string>;
  typTreningu?: string;
}) {
  // Stan lokalny — nie wpływa na statystyki dopóki nie klikniesz Zapisz
  const [statuses, setStatuses] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    zawodnicy.forEach((z) => {
      const obecny = initialStatus[z.id];
      if (obecny === 'obecny' || obecny === 'spozniony') {
        init[z.id] = 'obecny';
        return;
      }
      if (obecny === 'nieobecny' || obecny === 'usprawiedliwiony') {
        init[z.id] = 'nieobecny';
        return;
      }

      const poprzedni = previousStatus[z.id];
      if (poprzedni === 'nieobecny' || poprzedni === 'usprawiedliwiony') {
        init[z.id] = 'nieobecny';
        return;
      }

      init[z.id] = 'obecny';
    });
    return init;
  });

  // Detekcja niezapisanych zmian — do blokady wyjścia z karty
  const hasChanges = useMemo(() => {
    const initialCount = Object.keys(initialStatus).length;
    if (initialCount === 0) return false;

    for (const z of zawodnicy) {
      const wBazie = initialStatus[z.id];
      const wFormularzu = statuses[z.id];

      const znormalizowanyBazowy =
        wBazie === 'obecny' || wBazie === 'spozniony'
          ? 'obecny'
          : wBazie === 'nieobecny' || wBazie === 'usprawiedliwiony'
          ? 'nieobecny'
          : null;

      if (znormalizowanyBazowy !== wFormularzu) {
        return true;
      }
    }
    return false;
  }, [statuses, initialStatus, zawodnicy]);

  const [userTouched, setUserTouched] = useState(false);
  const showExitWarning =
    userTouched && (hasChanges || Object.keys(initialStatus).length === 0);

  // Ostrzeżenie przeglądarki przy próbie wyjścia — bez widocznego bannera
  useEffect(() => {
    if (!showExitWarning) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [showExitWarning]);

  const usesPrevious =
    Object.keys(initialStatus).length === 0 &&
    Object.keys(previousStatus).length > 0;

  const odziedziczoneNieobecnosci = useMemo(() => {
    if (!usesPrevious) return 0;
    let count = 0;
    zawodnicy.forEach((z) => {
      const poprzedni = previousStatus[z.id];
      if (poprzedni === 'nieobecny' || poprzedni === 'usprawiedliwiony') {
        count += 1;
      }
    });
    return count;
  }, [usesPrevious, previousStatus, zawodnicy]);

  const stats = useMemo(() => {
    const s = { obecny: 0, nieobecny: 0 };
    Object.values(statuses).forEach((v) => {
      if (v === 'obecny') s.obecny += 1;
      else if (v === 'nieobecny') s.nieobecny += 1;
    });
    return s;
  }, [statuses]);

  const total = zawodnicy.length;
  const procent = total > 0 ? Math.round((stats.obecny / total) * 100) : 0;

  const zmienStatus = (id: number, status: string) => {
    setStatuses((s) => ({ ...s, [id]: status }));
    setUserTouched(true);
  };

  return (
    <form action={zapiszObecnosc.bind(null, treningId)} className="space-y-3">
      {/* Info o dziedziczeniu z poprzedniego treningu */}
      {usesPrevious && odziedziczoneNieobecnosci > 0 && (
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl px-3 py-2.5 flex items-start gap-2 text-[11px] text-blue-200 animate-fadeIn">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            Skopiowano statusy z poprzedniego{' '}
            <span className="font-semibold">{typTreningu || 'treningu'}</span>.{' '}
            {odziedziczoneNieobecnosci}{' '}
            {odziedziczoneNieobecnosci === 1 ? 'osoba była' : 'osoby były'}{' '}
            nieobecne — zweryfikuj i zapisz.
          </span>
        </div>
      )}

      {/* Licznik na żywo */}
      <div className="bg-slate-900/80 backdrop-blur-lg border border-white/20 rounded-2xl p-3 animate-fadeIn sticky top-4 z-10 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-xl blur-md opacity-60" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white drop-shadow leading-none">
                {stats.obecny}
              </span>
              <span className="text-white/60 text-sm">/ {total}</span>
              <span className="text-white/80 text-xs ml-auto font-semibold">
                {procent}%
              </span>
            </div>
            <div className="text-[10px] text-white/60 mt-0.5">
              obecnych na treningu
            </div>
          </div>
        </div>
        <div className="mt-2 h-1 bg-slate-900/70 rounded-full overflow-hidden flex">
          {stats.obecny > 0 && (
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${(stats.obecny / total) * 100}%` }}
            />
          )}
          {stats.nieobecny > 0 && (
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
              style={{ width: `${(stats.nieobecny / total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Lista zawodników */}
      <ul className="space-y-1 md:space-y-1.5 pb-32">
        {zawodnicy.map((z, i) => {
          const aktualny = statuses[z.id];
          const opcjaAktywna = opcje.find((o) => o.value === aktualny);

          const isInherited =
            usesPrevious &&
            !initialStatus[z.id] &&
            (previousStatus[z.id] === 'nieobecny' ||
              previousStatus[z.id] === 'usprawiedliwiony');

          return (
            <li
              key={z.id}
              className={`bg-slate-900/80 backdrop-blur-md border rounded-lg md:rounded-xl px-2.5 md:px-3 py-1.5 md:py-2 animate-fadeIn stagger-${Math.min(
                i + 1,
                8
              )} ${
                isInherited
                  ? 'border-blue-400/30 ring-1 ring-blue-400/20'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5 md:gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className={`absolute inset-0 rounded-md md:rounded-lg blur-sm opacity-40 ${
                      opcjaAktywna?.bgActive.split(' ')[0] ?? ''
                    }`}
                  />
                  <div className="relative w-7 h-7 md:w-9 md:h-9 rounded-md md:rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-white/20 flex items-center justify-center font-bold text-white text-[10px] md:text-xs">
                    {z.numer ?? '—'}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs md:text-sm truncate text-white leading-tight">
                    {z.imie} {z.nazwisko}
                  </div>
                  <div
                    className={`text-[9px] md:text-[11px] font-medium truncate leading-tight mt-0.5 ${
                      opcjaAktywna?.color ?? 'text-white/60'
                    }`}
                  >
                    {opcjaAktywna?.title ?? '—'}
                    {isInherited && (
                      <span className="text-blue-300/70 ml-1.5 text-[8px] md:text-[9px] uppercase tracking-wider font-bold">
                        · z poprzedniego
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  {opcje.map((o) => {
                    const Icon = o.icon;
                    const aktywny = aktualny === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        title={o.title}
                        onClick={() => zmienStatus(z.id, o.value)}
                        className={`relative w-9 h-9 md:w-10 md:h-10 rounded-lg border flex items-center justify-center transition-all ${
                          aktywny
                            ? `${o.bgActive} scale-105`
                            : 'bg-white/5 border-white/15 hover:border-white/30 hover:bg-white/10 hover:scale-105'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 md:w-5 md:h-5 ${
                            aktywny ? 'text-white' : o.color
                          }`}
                          strokeWidth={aktywny ? 3 : 2.5}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Ukryte pola dla formularza */}
      {Object.entries(statuses).map(([zawodnikId, status]) => (
        <input
          key={zawodnikId}
          type="hidden"
          name={`status_${zawodnikId}`}
          value={status}
        />
      ))}

      {/* Przycisk zapisu */}
      <div className="sticky bottom-24 z-10 pt-2">
        <button
          type="submit"
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-500/60 hover:-translate-y-0.5 animate-glow text-sm md:text-base"
        >
          <Save className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          Zapisz obecność
        </button>
      </div>
    </form>
  );
}