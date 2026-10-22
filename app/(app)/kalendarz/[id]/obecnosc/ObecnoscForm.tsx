'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { zapiszObecnosc } from './actions';
import { Save, TrendingUp } from 'lucide-react';
import { ZawodnikRow, type Zawodnik, type StatusValue } from './ZawodnikRow';

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
  // ═══════════════════════════════════════════════════════════════
  // Inicjalizacja: mapujemy 4 możliwe statusy z bazy na 2 widoczne
  // w UI. Stare wpisy "spozniony" i "usprawiedliwiony" trafiają do
  // odpowiednich kubełków (obecny / nieobecny).
  // ═══════════════════════════════════════════════════════════════
  const [statuses, setStatuses] = useState<Record<number, StatusValue>>(() => {
    const init: Record<number, StatusValue> = {};
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

  // hasChanges - porównujemy znormalizowane wartości.
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

  // Blokada przed wyjściem - beforeunload, kliki w linki, back/forward.
  useEffect(() => {
    if (!showExitWarning) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const clickHandler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (!href.startsWith('/')) return;
      const ok = window.confirm('Masz niezapisane zmiany. Opuścić stronę?');
      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    const popStateHandler = () => {
      const ok = window.confirm('Masz niezapisane zmiany. Opuścić stronę?');
      if (!ok) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handler);
    document.addEventListener('click', clickHandler, true);
    window.addEventListener('popstate', popStateHandler);

    return () => {
      window.removeEventListener('beforeunload', handler);
      document.removeEventListener('click', clickHandler, true);
      window.removeEventListener('popstate', popStateHandler);
    };
  }, [showExitWarning]);

  const usesPrevious =
    Object.keys(initialStatus).length === 0 &&
    Object.keys(previousStatus).length > 0;

  // Mapa: zawodnikId → czy status jest "odziedziczony" z poprzedniego
  // treningu (tylko dla niezapisanych wpisów). Wyliczamy raz, żeby
  // ZawodnikRow dostał stabilny boolean (React.memo porówna po wartości).
  const inheritedMap = useMemo(() => {
    const map = new Map<number, boolean>();
    if (!usesPrevious) {
      zawodnicy.forEach((z) => map.set(z.id, false));
      return map;
    }
    zawodnicy.forEach((z) => {
      const poprzedni = previousStatus[z.id];
      const isInherited =
        !initialStatus[z.id] &&
        (poprzedni === 'nieobecny' || poprzedni === 'usprawiedliwiony');
      map.set(z.id, isInherited);
    });
    return map;
  }, [usesPrevious, previousStatus, initialStatus, zawodnicy]);

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

  // useCallback - stabilna referencja dla React.memo w ZawodnikRow.
  // Bez tego każdy render tworzyłby nową funkcję i memo byłby bezużyteczny.
  const zmienStatus = useCallback((id: number, status: StatusValue) => {
    setStatuses((s) => (s[id] === status ? s : { ...s, [id]: status }));
    setUserTouched(true);
  }, []);

  return (
    <form action={zapiszObecnosc.bind(null, treningId)} className="space-y-3">
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
              <span className="text-white/80 text-xs ml-auto font-semibold">{procent}%</span>
            </div>
            <div className="text-[10px] text-white/60 mt-0.5 flex items-center gap-2">
              <span>obecnych na treningu</span>
              {stats.nieobecny > 0 && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="text-red-400/80 font-medium">
                    {stats.nieobecny} nieob.
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 h-1 bg-slate-900/70 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              procent >= 80
                ? 'bg-gradient-to-r from-green-500 to-green-400'
                : procent >= 50
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${procent}%` }}
          />
        </div>
      </div>

      {/* Lista zawodników - każdy wiersz to React.memo */}
      <ul className="space-y-1 md:space-y-1.5">
        {zawodnicy.map((z, i) => (
          <ZawodnikRow
            key={z.id}
            zawodnik={z}
            status={statuses[z.id] ?? 'obecny'}
            isInherited={inheritedMap.get(z.id) ?? false}
            onChange={zmienStatus}
            index={i}
          />
        ))}
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

      <button
        type="submit"
        className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-500/60 hover:-translate-y-0.5 animate-glow text-sm md:text-base mt-2"
      >
        <Save className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
        Zapisz obecność
      </button>
    </form>
  );
}