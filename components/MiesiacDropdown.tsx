'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronDown, CheckCircle2 } from 'lucide-react';

type Miesiac = {
  iso: string;
  label: string;
  treningi: number;
  procent: number;
};

export function MiesiacDropdown({
  miesiace,
  aktywny,
  sort,
}: {
  miesiace: Miesiac[];
  aktywny: string | null;
  sort: string;
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

  const buildHref = (mm: string) => {
    const p = new URLSearchParams();
    p.set('okres', 'month');
    p.set('m', mm);
    if (sort && sort !== 'obecnosci') p.set('sort', sort);
    return `/statystyki?${p.toString()}`;
  };

  const aktywnyLabel = aktywny
    ? miesiace.find((mm) => mm.iso === aktywny)?.label ?? 'Konkretny miesiąc'
    : 'Konkretny miesiąc';

  const isActive = !!aktywny;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`px-3 md:px-4 py-2 rounded-xl border text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
          isActive
            ? 'bg-green-500/15 border-green-400/50 text-green-400'
            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/25'
        }`}
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        {aktywnyLabel}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-white/10">
            <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">
              Wybierz miesiąc
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {miesiace.length === 0 ? (
              <div className="px-3 py-4 text-xs text-white/40 text-center">
                Brak treningów w historii
              </div>
            ) : (
              miesiace.map((mm) => {
                const isActiveItem = aktywny === mm.iso;
                return (
                  <Link
                    key={mm.iso}
                    href={buildHref(mm.iso)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                      isActiveItem
                        ? 'bg-green-500/10 border-l-2 border-green-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isActiveItem ? 'text-green-400' : 'text-white/90'
                        }`}
                      >
                        {mm.label}
                      </div>
                      <div className="text-[10px] text-white/40">
                        {mm.treningi}{' '}
                        {mm.treningi === 1 ? 'trening' : 'treningów'} ·{' '}
                        {mm.procent}% frekwencji
                      </div>
                    </div>
                    {isActiveItem && (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}