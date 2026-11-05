'use client';

import { memo } from 'react';
import { Check, X } from 'lucide-react';

export type Zawodnik = {
  id: number;
  imie: string;
  nazwisko: string;
  numer: number | null;
  pozycja: string | null;
};

export type StatusValue = 'obecny' | 'nieobecny';

const opcje = [
  { value: 'obecny', icon: Check, title: 'Obecny', color: 'text-green-400', bgActive: 'bg-gradient-to-br from-green-500 to-green-700 border-green-400 shadow-lg shadow-green-900/50' },
  { value: 'nieobecny', icon: X, title: 'Nieobecny', color: 'text-red-400', bgActive: 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-lg shadow-red-900/50' },
] as const;

export const ZawodnikRow = memo(function ZawodnikRow({
  zawodnik,
  status,
  onChange,
  index,
}: {
  zawodnik: Zawodnik;
  status: StatusValue;
  onChange: (id: number, status: StatusValue) => void;
  index: number;
}) {
  const inicjaly = `${zawodnik.imie.charAt(0)}${zawodnik.nazwisko.charAt(0)}`.toUpperCase();
  const opcjaAktywna = opcje.find((o) => o.value === status);

  return (
    <li className={`bg-slate-900/95 md:bg-slate-900/80 md:backdrop-blur-md border border-white/10 rounded-lg md:rounded-xl px-2.5 md:px-3 py-1.5 md:py-2 animate-fadeIn stagger-${Math.min(index + 1, 8)}`}>
      <div className="flex items-center gap-2.5 md:gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-white/70 text-xs md:text-xs">
            {inicjaly}
          </div>
          {zawodnik.numer != null && (
            <div className="absolute -bottom-1 -right-1 px-1 py-0 md:px-1.5 md:py-0.5 rounded bg-slate-950 border border-amber-400/40 text-amber-400 text-[9px] font-bold leading-tight">
              {zawodnik.numer}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate text-white leading-tight">
            {zawodnik.imie} {zawodnik.nazwisko}
          </div>
          <div className={`text-[11px] font-medium truncate leading-tight mt-0.5 ${opcjaAktywna?.color ?? 'text-white/60'}`}>
            {opcjaAktywna?.title ?? '-'}
          </div>
        </div>

        <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
          {opcje.map((o) => {
            const Icon = o.icon;
            const aktywny = status === o.value;
            return (
              <button
                key={o.value}
                type="button"
                title={o.title}
                aria-label={o.title}
                onClick={() => onChange(zawodnik.id, o.value)}
                className={`relative w-11 h-11 md:w-10 md:h-10 rounded-xl border flex items-center justify-center transition-all ${
                  aktywny
                    ? `${o.bgActive} scale-105`
                    : 'bg-white/5 border-white/15 hover:border-white/30 hover:bg-white/10 hover:scale-105'
                }`}
              >
                <Icon className={`w-5 h-5 ${aktywny ? 'text-white' : o.color}`} strokeWidth={aktywny ? 3 : 2.5} />
              </button>
            );
          })}
        </div>
      </div>
    </li>
  );
});