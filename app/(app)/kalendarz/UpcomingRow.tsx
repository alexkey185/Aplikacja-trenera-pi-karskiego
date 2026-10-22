// app/(app)/kalendarz/UpcomingRow.tsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TYP_CONFIG } from './constants';
import { pad2, parseISO } from './utils';
import { DeleteEventButtonLazy } from '@/components/DeleteEventButtonLazy';
import type { Trening } from './types';

export function UpcomingRow({ trening }: { trening: Trening }) {
  const cfg = TYP_CONFIG[trening.typ] ?? TYP_CONFIG.trening;
  const d = parseISO(trening.data);
  return (
    <div className="group relative">
      <Link
        href={`/kalendarz/${trening.id}/obecnosc`}
        className="block bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl p-2.5 pr-20 transition-all"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md text-white text-sm font-black flex-shrink-0`}
          >
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="font-bold text-white">
                {pad2(d.getDate())}.{pad2(d.getMonth() + 1)}
              </span>
              <span className="text-white/50">·</span>
              <span className="font-semibold text-white">{trening.godzina}</span>
            </div>
            <div className="text-[10px] text-white/60 mt-0.5 truncate">
              {cfg.label}
              {trening.przeciwnik && ` vs ${trening.przeciwnik}`}
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 z-10">
        <DeleteEventButtonLazy id={trening.id} cyklId={trening.cykl_id} size="sm" />
        <Link
          href={`/kalendarz/${trening.id}/obecnosc`}
          className="w-5 h-5 text-white/40 hover:text-green-400 transition-all flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}