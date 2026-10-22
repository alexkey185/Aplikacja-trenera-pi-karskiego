// app/(app)/kalendarz/EventCard.tsx
'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Pencil,
  ExternalLink,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { TYP_CONFIG } from './constants';
import type { Trening, StatsMap } from './types';

// Lazy load - chunk z ConfirmDialog (~8 KB) ładuje się dopiero
// gdy użytkownik ma wydarzenia w danym dniu.
const DeleteEventButton = dynamic(
  () => import('./DeleteEventButton').then((m) => m.DeleteEventButton),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20"
        title="Usun wydarzenie"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    ),
  }
);

export function EventCard({
  trening,
  stats,
  onDragStart,
  isDragging,
  highlighted = false,
}: {
  trening: Trening;
  stats: StatsMap;
  onDragStart?: (e: React.DragEvent, id: number) => void;
  isDragging?: boolean;
  highlighted?: boolean;
}) {
  const router = useRouter();
  const cfg = TYP_CONFIG[trening.typ] ?? TYP_CONFIG.trening;
  const s = stats[trening.id];
  const proc = s && s.total > 0 ? Math.round((s.obecni / s.total) * 100) : 0;

  const mapsUrl = trening.miejsce?.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        trening.miejsce.trim()
      )}`
    : null;

  const goToAttendance = () => {
    router.push(`/kalendarz/${trening.id}/obecnosc`);
  };

  return (
    <div
      className={`group relative rounded-xl transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${
        highlighted
          ? 'bg-green-500/[0.06] border-[1.5px] border-green-400/55 shadow-[0_0_12px_rgba(34,197,94,0.25)]'
          : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20'
      }`}
    >
      <div
        onClick={goToAttendance}
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart?.(e, trening.id)}
        className="block p-2.5 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md text-white text-sm font-black flex-shrink-0`}
          >
            {cfg.icon}
          </div>
          <div className="flex-shrink-0 w-12">
            <div className="text-sm font-bold text-white">{trening.godzina}</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex-1 min-w-0 pr-24">
            <div className="font-semibold text-white text-xs truncate">
              {cfg.label}
              {trening.przeciwnik && (
                <span className="text-white/60 font-medium"> vs {trening.przeciwnik}</span>
              )}
            </div>
            {trening.miejsce ? (
              mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  title="Otworz w Google Maps"
                  className="text-[10px] text-white/50 hover:text-green-400 mt-0.5 flex items-center gap-1 group/maps transition-colors w-fit max-w-full"
                >
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{trening.miejsce}</span>
                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-60 group-hover/maps:opacity-100" />
                </a>
              ) : (
                <div className="text-[10px] text-white/50 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{trening.miejsce}</span>
                </div>
              )
            ) : (
              <div className="text-[10px] text-white/50 mt-0.5">Brak lokalizacji</div>
            )}
            {s && s.total > 0 ? (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-white/60">
                  Obecni {s.obecni}/{s.total}
                </span>
                <div className="flex-1 max-w-[60px] h-0.5 bg-slate-950/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${proc}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-white/40 mt-1">Brak wpisow</div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 pointer-events-none">
        <div className="pointer-events-auto">
          <Link
            href={`/kalendarz/${trening.id}/edytuj`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/40 hover:text-white transition-all"
            title="Edytuj wydarzenie"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="pointer-events-auto">
          <DeleteEventButton id={trening.id} cyklId={trening.cykl_id} />
        </div>
        <ChevronRight
          className={`w-4 h-4 transition-all flex-shrink-0 ${
            highlighted ? 'text-green-400' : 'text-white/40'
          }`}
        />
      </div>
    </div>
  );
}