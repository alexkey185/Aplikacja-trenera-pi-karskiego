'use client';

import type { LucideIcon } from 'lucide-react';

export function CompactStat({
  icon: Icon,
  color,
  bg,
  border,
  label,
  value,
}: {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  label: string;
  value: number;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-900/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 bg-gradient-to-br ${bg} border ${border} animate-fadeIn shadow-lg shadow-black/30 flex flex-col justify-between h-full`}
    >
      <div className="flex items-start justify-between w-full">
        {/* Ikona - lewy górny róg */}
        <div
          className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 ${color}`}
        >
          <Icon className="w-4 h-4 lg:w-4.5 lg:h-4.5" strokeWidth={2.5} />
        </div>
        
        {/* Liczba - prawy górny róg (tam gdzie wskazują strzałki) */}
        <div className="text-2xl lg:text-3xl font-bold text-white drop-shadow leading-none tabular-nums text-right">
          {value}
        </div>
      </div>
      
      {/* Etykieta - dół */}
      <div className="text-[10px] lg:text-xs text-white/60 uppercase tracking-wider font-semibold mt-3 text-left w-full truncate">
        {label}
      </div>
    </div>
  );
}