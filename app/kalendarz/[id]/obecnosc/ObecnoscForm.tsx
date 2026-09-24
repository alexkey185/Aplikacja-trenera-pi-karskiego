'use client';

import { useState } from 'react';
import { zapiszObecnosc } from './actions';

type Zawodnik = {
  id: number;
  imie: string;
  nazwisko: string;
  numer: number | null;
  pozycja: string | null;
};

const opcje = [
  { value: 'obecny', label: '✅', title: 'Obecny' },
  { value: 'spozniony', label: '⏰', title: 'Spóźniony' },
  { value: 'nieobecny', label: '❌', title: 'Nieobecny' },
  { value: 'usprawiedliwiony', label: '📝', title: 'Usprawiedliwiony' },
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

  return (
    <form action={zapiszObecnosc.bind(null, treningId)} className="space-y-3">
      {zawodnicy.map((z) => (
        <div
          key={z.id}
          className="bg-slate-800 rounded-lg p-3 flex items-center gap-3 flex-wrap"
        >
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm">
            {z.numer ?? '—'}
          </div>
          <div className="flex-1 min-w-[140px]">
            <div className="font-semibold text-sm">
              {z.imie} {z.nazwisko}
            </div>
            <div className="text-xs text-slate-400">{z.pozycja ?? '—'}</div>
          </div>
          <div className="flex gap-1">
            {opcje.map((o) => {
              const aktywny = statuses[z.id] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  title={o.title}
                  onClick={() =>
                    setStatuses((s) => ({ ...s, [z.id]: o.value }))
                  }
                  className={`cursor-pointer px-3 py-2 rounded-lg border text-lg transition-colors ${
                    aktywny
                      ? 'bg-green-600 border-green-600'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <input
            type="hidden"
            name={`status_${z.id}`}
            value={statuses[z.id] ?? 'obecny'}
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-3 rounded-lg mt-4"
      >
        💾 Zapisz obecność
      </button>
    </form>
  );
}