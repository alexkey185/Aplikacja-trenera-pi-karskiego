'use client';

import { useState, useMemo } from 'react';
import { zapiszObecnosc } from './actions';
import {
  Check,
  Clock,
  X,
  FileText,
  Save,
  Users,
  TrendingUp,
} from 'lucide-react';

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
    bgActive: 'bg-gradient-to-br from-green-500 to-green-700 border-green-400 shadow-lg shadow-green-900/50',
  },
  {
    value: 'spozniony',
    icon: Clock,
    title: 'Spóźniony',
    color: 'text-yellow-400',
    bgActive: 'bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-400 shadow-lg shadow-yellow-900/50',
  },
  {
    value: 'nieobecny',
    icon: X,
    title: 'Nieobecny',
    color: 'text-red-400',
    bgActive: 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-lg shadow-red-900/50',
  },
  {
    value: 'usprawiedliwiony',
    icon: FileText,
    title: 'Usprawiedliwiony',
    color: 'text-blue-400',
    bgActive: 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400 shadow-lg shadow-blue-900/50',
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
      init[z.id] = initialStatus[z.id] ?? 'obecny';
    });
    return init;
  });

  const stats = useMemo(() => {
    const s = { obecny: 0, spozniony: 0, nieobecny: 0, usprawiedliwiony: 0 };
    Object.values(statuses).forEach((v) => {
      if (v in s) s[v as keyof typeof s] += 1;
    });
    return s;
  }, [statuses]);

  const obecni = stats.obecny + stats.spozniony;
  const total = zawodnicy.length;
  const procent = total > 0 ? Math.round((obecni / total) * 100) : 0;

  const zmienStatus = (zawodnikId: number, status: string) => {
    setStatuses((s) => ({ ...s, [zawodnikId]: status }));
  };

  return (
    <form action={zapiszObecnosc.bind(null, treningId)} className="space-y-3">
      {/* Licznik na żywo */}
      <div className="glass-strong rounded-2xl p-4 animate-fadeIn sticky top-4 z-10 mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-xl blur-md opacity-50" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{obecni}</span>
              <span className="text-slate-500 text-lg">/ {total}</span>
              <span className="text-slate-400 text-sm ml-auto font-semibold">
                {procent}%
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">obecnych na treningu</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-slate-900/70 rounded-full overflow-hidden flex">
          {stats.obecny > 0 && (
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${(stats.obecny / total) * 100}%` }}
            />
          )}
          {stats.spozniony > 0 && (
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-500"
              style={{ width: `${(stats.spozniony / total) * 100}%` }}
            />
          )}
          {stats.nieobecny > 0 && (
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
              style={{ width: `${(stats.nieobecny / total) * 100}%` }}
            />
          )}
          {stats.usprawiedliwiony > 0 && (
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${(stats.usprawiedliwiony / total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Lista zawodników */}
      <ul className="space-y-2">
        {zawodnicy.map((z, i) => {
          const aktualny = statuses[z.id];
          const opcjaAktywna = opcje.find((o) => o.value === aktualny);
          const ringColor = opcjaAktywna?.color ?? 'text-slate-400';

          return (
            <li
              key={z.id}
              className={`glass rounded-2xl p-3 animate-fadeIn stagger-${Math.min(
                i + 1,
                8
              )}`}
            >
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="relative flex-shrink-0">
                  <div
                    className={`absolute inset-0 rounded-xl blur-md opacity-40 ${opcjaAktywna?.bgActive.split(' ')[0] ?? ''}`}
                  />
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center font-bold text-white">
                    {z.numer ?? '—'}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {z.imie} {z.nazwisko}
                  </div>
                  <div className={`text-xs ${ringColor} font-medium truncate`}>
                    {opcjaAktywna?.title ?? '—'}
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
                        className={`relative w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                          aktywny
                            ? `${o.bgActive} scale-105`
                            : 'bg-slate-900/60 border-slate-700/50 hover:border-slate-600 hover:bg-slate-900 hover:scale-105'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
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

      {/* Hidden inputs dla formularza */}
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
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-900/60 hover:-translate-y-0.5 animate-glow"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Zapisz obecność
        </button>
      </div>
    </form>
  );
}