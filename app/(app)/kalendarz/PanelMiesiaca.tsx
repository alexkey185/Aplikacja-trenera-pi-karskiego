// app/(app)/kalendarz/PanelMiesiaca.tsx
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Award } from 'lucide-react';
import type { Trening, StatsMap } from './types';

export function PanelMiesiaca({
  monthStats,
  monthLabel,
  treningi,
  stats,
  monthPrefix,
  onAddClick,
}: {
  monthStats: {
    treningi: number;
    mecze: number;
    sparingi: number;
    turnieje: number;
    total: number;
  };
  monthLabel: string;
  treningi: Trening[];
  stats: StatsMap;
  monthPrefix: string;
  onAddClick: () => void;
}) {
  const frekwencja = useMemo(() => {
    const inMonth = treningi.filter((t) => t.data.startsWith(monthPrefix));
    let obecni = 0;
    let total = 0;
    inMonth.forEach((t) => {
      const s = stats[t.id];
      if (s) {
        obecni += s.obecni;
        total += s.total;
      }
    });
    const procent = total > 0 ? Math.round((obecni / total) * 100) : 0;
    return { obecni, total, procent };
  }, [treningi, stats, monthPrefix]);

  const kolorProcent = (p: number) => {
    if (p >= 80) return { text: 'text-green-400', bg: 'from-green-500 to-green-400' };
    if (p >= 60) return { text: 'text-yellow-400', bg: 'from-yellow-500 to-yellow-400' };
    return { text: 'text-red-400', bg: 'from-red-500 to-red-400' };
  };

  const kol = kolorProcent(frekwencja.procent);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-5 animate-fadeIn shadow-2xl shadow-black/60">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
        <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">
          {monthLabel}
        </h2>
      </div>

      <div className="mb-5">
        <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2">
          Frekwencja
        </div>
        {frekwencja.total > 0 ? (
          <>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-4xl font-black leading-none ${kol.text}`}>
                {frekwencja.procent}
              </span>
              <span className="text-lg text-white/40 font-bold">%</span>
            </div>
            <div className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${kol.bg}`}
                style={{ width: `${frekwencja.procent}%` }}
              />
            </div>
            <div className="text-[10px] text-white/50">
              {frekwencja.obecni} obecnych z {frekwencja.total} wpisow
            </div>
          </>
        ) : (
          <div className="text-xs text-white/40 py-2">Brak wpisow obecnosci</div>
        )}
      </div>

      <div className="mb-5 pt-4 border-t border-white/10">
        <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2">
          Rozklad
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-blue-500/10 border border-blue-400/20">
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-xs text-white/70 flex-1">Treningi</span>
            <span className="text-xs font-bold text-white">{monthStats.treningi}</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-400/20">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-xs text-white/70 flex-1">Mecze</span>
            <span className="text-xs font-bold text-white">{monthStats.mecze}</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-orange-500/10 border border-orange-400/20">
            <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
            <span className="text-xs text-white/70 flex-1">Sparingi</span>
            <span className="text-xs font-bold text-white">{monthStats.sparingi}</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-400/20">
            <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
            <span className="text-xs text-white/70 flex-1">Turnieje</span>
            <span className="text-xs font-bold text-white">{monthStats.turnieje}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onAddClick}
        className="group w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-xs font-bold transition-all shadow-lg shadow-green-500/30"
      >
        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
        Dodaj wydarzenie
      </button>

      <Link
        href="/statystyki"
        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-xs font-semibold transition-all"
      >
        <Award className="w-3.5 h-3.5" />
        Pelne statystyki
      </Link>
    </div>
  );
}