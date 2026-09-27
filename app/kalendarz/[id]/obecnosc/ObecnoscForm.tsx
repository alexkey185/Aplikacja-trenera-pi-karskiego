'use client';

import { useState, useMemo } from 'react';
import { zapiszObecnosc } from './actions';
import { Check, X, Save, TrendingUp } from 'lucide-react';

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
}: {
  treningId: number;
  zawodnicy: Zawodnik[];
  initialStatus: Record<number, string>;
}) {
  const [statuses, setStatuses] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    zawodnicy.forEach((z) => {
      const stary = initialStatus[z.id];
      let nowy: string = 'obecny';
      if (stary === 'nieobecny' || stary === 'usprawiedliwiony') {
        nowy = 'nieobecny';
      }
      init[z.id] = nowy;
    });
    return init;
  });

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
  };

  return (
    <form action={zapiszObecnosc.bind(null, treningId)} className="space-y-3">
      {/* Licznik na żywo */}
      <div className="bg-slate-900/80 backdrop-blur-lg border border-white/20 rounded-2xl p-4 animate-fadeIn sticky top-4 z-10 mb-2 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-xl blur-md opacity-60" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white drop-shadow">
                {stats.obecny}
              </span>
              <span className="text-white/60 text-lg">/ {total}</span>
              <span className="text-white/80 text-sm ml-auto font-semibold">
                {procent}%
              </span>
            </div>
            <div className="text-xs text-white/70 mt-0.5">
              obecnych na treningu
            </div>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-slate-900/70 rounded-full overflow-hidden flex">
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

      {/* Lista zawodników — pb-32 dodaje odstęp na dole, żeby przycisk nie przykrywał ostatniej karty */}
      <ul className="space-y-2 pb-32">
        {zawodnicy.map((z, i) => {
          const aktualny = statuses[z.id];
          const opcjaAktywna = opcje.find((o) => o.value === aktualny);
          const ringColor = opcjaAktywna?.color ?? 'text-white/60';

          return (
            <li
              key={z.id}
              className={`bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 animate-fadeIn stagger-${Math.min(
                i + 1,
                8
              )}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className={`absolute inset-0 rounded-xl blur-md opacity-40 ${
                      opcjaAktywna?.bgActive.split(' ')[0] ?? ''
                    }`}
                  />
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/20 flex items-center justify-center font-bold text-white">
                    {z.numer ?? '—'}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate text-white drop-shadow">
                    {z.imie} {z.nazwisko}
                  </div>
                  <div className={`text-xs ${ringColor} font-medium truncate`}>
                    {opcjaAktywna?.title ?? '—'}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {opcje.map((o) => {
                    const Icon = o.icon;
                    const aktywny = aktualny === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        title={o.title}
                        onClick={() => zmienStatus(z.id, o.value)}
                        className={`relative w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                          aktywny
                            ? `${o.bgActive} scale-105`
                            : 'bg-white/5 border-white/15 hover:border-white/30 hover:bg-white/10 hover:scale-105'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
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

      {/* Przycisk zapisu — sticky na dole */}
      <div className="sticky bottom-24 z-10 pt-2">
        <button
          type="submit"
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-500/60 hover:-translate-y-0.5 animate-glow"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Zapisz obecność
        </button>
      </div>
    </form>
  );
}