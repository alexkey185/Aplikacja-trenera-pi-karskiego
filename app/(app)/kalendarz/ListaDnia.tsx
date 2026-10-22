// app/(app)/kalendarz/ListaDnia.tsx
'use client';

import { Plus } from 'lucide-react';
import { EventCard } from './EventCard';
import { DAYS_LONG, MONTHS_PL_GENITIVE } from './constants';
import { pad2, parseISO } from './utils';
import type { Trening, StatsMap } from './types';

export function ListaDnia({
  selectedDate,
  todayISO,
  events,
  stats,
  onAddClick,
  onDragStart,
  draggedId,
}: {
  selectedDate: string;
  todayISO: string;
  events: Trening[];
  stats: StatsMap;
  onAddClick: () => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  draggedId: number | null;
}) {
  const dateObj = parseISO(selectedDate);
  const isToday = selectedDate === todayISO;
  const monthGenitive = MONTHS_PL_GENITIVE[dateObj.getMonth()];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-5 animate-fadeIn shadow-2xl shadow-black/60">
      <div className="mb-4 lg:mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl lg:text-3xl font-black text-white">
            {pad2(dateObj.getDate())}
          </div>
          <div>
            <div className="text-sm lg:text-base font-bold text-white/90">
              {DAYS_LONG[dateObj.getDay()]}
            </div>
            <div className="text-xs lg:text-sm text-white/50 capitalize">
              {monthGenitive} {dateObj.getFullYear()}
            </div>
          </div>
        </div>
        {isToday && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-400/30 rounded-full px-2.5 py-1">
            Dzisiaj
          </span>
        )}
      </div>
      <div className="space-y-2">
        {events.map((t) => (
          <EventCard
            key={t.id}
            trening={t}
            stats={stats}
            onDragStart={onDragStart}
            isDragging={draggedId === t.id}
            highlighted
          />
        ))}
      </div>
      <button
        onClick={onAddClick}
        className="group w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-white/50 hover:text-white text-xs font-semibold transition-all"
      >
        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
        Dodaj kolejne wydarzenie
      </button>
    </div>
  );
}