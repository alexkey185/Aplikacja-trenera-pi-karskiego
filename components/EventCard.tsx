'use client';

import Link from 'next/link';
import { MapPin, Pencil, ChevronRight, ExternalLink, Home, Plane } from 'lucide-react';
import { DeleteEventButtonLazy } from '@/components/DeleteEventButtonLazy';
import { getTypConfig } from '@/lib/treningi';

export type EventCardTrening = {
  id: number;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  cykl_id?: string | null;
  is_home?: boolean | null;
  wynik_gospodarzy?: number | null;
  wynik_gosci?: number | null;
};

export function EventCard({
  trening,
  variant = 'compact',
  stats,
}: {
  trening: EventCardTrening;
  variant?: 'compact' | 'full';
  stats?: { obecni: number; nieobecni: number };
}) {
  const cfg = getTypConfig(trening.typ);
  const Icon = cfg.icon;
  const mapsUrl = trening.miejsce?.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trening.miejsce.trim())}`
    : null;

  const isMecz = trening.typ === 'mecz' || trening.typ === 'sparing';
  const hasScore = trening.wynik_gospodarzy !== null && trening.wynik_gosci !== null && trening.wynik_gospodarzy !== undefined && trening.wynik_gosci !== undefined;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-xl border-l-4 ${cfg.borderL} bg-white/5 hover:bg-white/10 transition-all`}>
        <Link href={`/kalendarz/${trening.id}/obecnosc`} className="flex-1 flex items-center gap-2 min-w-0" title="Otwórz obecność">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-shrink-0 text-xs font-bold text-white tabular-nums">{trening.godzina}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white truncate capitalize flex items-center gap-1.5">
              {cfg.label}
              {trening.przeciwnik && <span className="text-white/60"> vs {trening.przeciwnik}</span>}
              {isMecz && hasScore && (
                <span className="inline-flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trening.wynik_gospodarzy! > trening.wynik_gosci! ? 'bg-green-500/20 text-green-400' : trening.wynik_gospodarzy! < trening.wynik_gosci! ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-300'}`}>
                    {trening.wynik_gospodarzy} : {trening.wynik_gosci}
                  </span>
                  {trening.is_home ? <Home className="w-3 h-3 text-green-400" /> : <Plane className="w-3 h-3 text-orange-400" />}
                </span>
              )}
            </div>
            {trening.miejsce && <div className="text-[10px] text-white/50 truncate">{trening.miejsce}</div>}
          </div>
        </Link>
        <Link href={`/kalendarz/${trening.id}/edytuj`} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all flex-shrink-0" title="Edytuj">
          <Pencil className="w-3 h-3" />
        </Link>
        <DeleteEventButtonLazy id={trening.id} cyklId={trening.cykl_id} size="sm" />
        <Link href={`/kalendarz/${trening.id}/obecnosc`} className="w-5 h-5 text-white/40 hover:text-green-400 transition-all flex-shrink-0" title="Przejdź do obecności">
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className={`group relative flex flex-col p-3 rounded-2xl border-l-4 ${cfg.borderL} bg-white/5 hover:bg-white/10 transition-all gap-3`}>
      <div className="flex items-center gap-2">
        <Link href={`/kalendarz/${trening.id}/obecnosc`} className="absolute inset-0 z-0 rounded-2xl" />
        <div className="relative z-10 pointer-events-none flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-shrink-0">
            <div className="text-lg font-bold text-white leading-none">{trening.godzina}</div>
          </div>
          <div className="w-px h-10 bg-white/10 flex-shrink-0 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm truncate capitalize flex items-center gap-2">
              {trening.typ}
              {trening.przeciwnik && <span className="text-white/60 font-normal"> vs {trening.przeciwnik}</span>}
              {isMecz && hasScore && (
                <span className="inline-flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trening.wynik_gospodarzy! > trening.wynik_gosci! ? 'bg-green-500/20 text-green-400' : trening.wynik_gospodarzy! < trening.wynik_gosci! ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-300'}`}>
                    {trening.wynik_gospodarzy} : {trening.wynik_gosci}
                  </span>
                  {trening.is_home ? <Home className="w-3.5 h-3.5 text-green-400" /> : <Plane className="w-3.5 h-3.5 text-orange-400" />}
                </span>
              )}
            </div>
            {stats && (stats.obecni > 0 || stats.nieobecni > 0) && (
              <div className="text-xs mt-1 flex items-center gap-3">
                <span className="text-green-400 font-medium">✓ {stats.obecni}</span>
                {stats.nieobecni > 0 && <span className="text-red-400 font-medium">✗ {stats.nieobecni}</span>}
              </div>
            )}
          </div>
        </div>
        <Link href={`/kalendarz/${trening.id}/edytuj`} className="hidden md:flex relative z-10 pointer-events-auto w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 items-center justify-center text-white/50 hover:text-white transition-all flex-shrink-0">
          <Pencil className="w-4 h-4" />
        </Link>
        <div className="relative z-10 pointer-events-auto flex-shrink-0">
          <DeleteEventButtonLazy id={trening.id} cyklId={trening.cykl_id} size="md" />
        </div>
        <Link href={`/kalendarz/${trening.id}/obecnosc`} className="relative z-10 w-5 h-5 text-white/40 hover:text-green-400 transition-all flex-shrink-0">
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
      {mapsUrl ? (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-400/30 text-white/70 hover:text-green-300 transition-all text-xs font-medium" title="Otwórz w Google Maps">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
          <span className="truncate flex-1">{trening.miejsce}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
        </a>
      ) : (
        <div className="relative z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-white/40 text-xs">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Brak adresu — dodaj w edycji wydarzenia</span>
        </div>
      )}
    </div>
  );
}