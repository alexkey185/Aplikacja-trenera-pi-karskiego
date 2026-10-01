'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

type Preset = { key: string; label: string };
type Miesiac = { iso: string; label: string; treningi: number; procent: number };

export function OkresDropdown({
  presety,
  miesiace,
  aktywnyPreset,
  aktywnyMiesiac,
}: {
  presety: Preset[];
  miesiace: Miesiac[];
  aktywnyPreset: string | null;
  aktywnyMiesiac: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const buildHref = (o: string, mm?: string) => {
    const p = new URLSearchParams();
    p.set('okres', o);
    if (mm) p.set('m', mm);
    return `/statystyki?${p.toString()}`;
  };

  const displayLabel = aktywnyMiesiac
    ? miesiace.find((mm) => mm.iso === aktywnyMiesiac)?.label ?? 'Wybierz okres'
    : presety.find((p) => p.key === aktywnyPreset)?.label ?? 'Wybierz okres';

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
          open
            ? 'bg-white/10 border-white/25 ring-2 ring-green-400/30'
            : 'bg-white/5 border-white/10 hover:border-white/20'
        }`}
      >
        <CalendarIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
        <span className="text-xs font-bold text-white flex-1 text-left truncate">
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/50 flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50">
          {/* Szybkie presety */}
          <div className="px-3 py-2 border-b border-white/10 bg-slate-950/40">
            <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">
              Szybkie
            </div>
          </div>
          <div>
            {presety.map((p) => {
              const isActive = !aktywnyMiesiac && aktywnyPreset === p.key;
              return (
                <Link
                  key={p.key}
                  href={buildHref(p.key)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                    isActive
                      ? 'bg-green-500/10 border-l-2 border-green-500'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`flex-1 text-sm font-semibold ${
                      isActive ? 'text-green-400' : 'text-white/90'
                    }`}
                  >
                    {p.label}
                  </span>
                  {isActive && (
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" strokeWidth={3} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Konkretne miesiące */}
          {miesiace.length > 0 && (
            <>
              <div className="px-3 py-2 border-y border-white/10 bg-slate-950/40">
                <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">
                  Konkretny miesiąc
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {miesiace.map((mm) => {
                  const isActive = aktywnyMiesiac === mm.iso;
                  return (
                    <Link
                      key={mm.iso}
                      href={buildHref('month', mm.iso)}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                        isActive
                          ? 'bg-green-500/10 border-l-2 border-green-500'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-semibold truncate ${
                            isActive ? 'text-green-400' : 'text-white/90'
                          }`}
                        >
                          {mm.label}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {mm.treningi}{' '}
                          {mm.treningi === 1 ? 'trening' : 'treningów'} · {mm.procent}%
                        </div>
                      </div>
                      {isActive && (
                        <Check
                          className="w-4 h-4 text-green-400 flex-shrink-0"
                          strokeWidth={3}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}