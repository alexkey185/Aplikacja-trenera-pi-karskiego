'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export function TimePicker({
  name,
  defaultValue = '18:00',
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [hour, minute] = value.split(':');
  const ref = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  // Zamknij przy kliknięciu poza
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

  // Po otwarciu - przewiń do aktualnie wybranych wartości
  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      const h = hourListRef.current?.querySelector(
        `[data-value="${hour}"]`
      ) as HTMLElement | null;
      const m = minuteListRef.current?.querySelector(
        `[data-value="${minute}"]`
      ) as HTMLElement | null;
      h?.scrollIntoView({ block: 'center' });
      m?.scrollIntoView({ block: 'center' });
    }, 30);
  }, [open, hour, minute]);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left py-2 text-white"
      >
        <span className="font-semibold tabular-nums text-base">{value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/40 ml-auto transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex">
          {/* Godziny */}
          <div
            ref={hourListRef}
            className="w-16 h-56 overflow-y-auto py-2"
          >
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                data-value={h}
                onClick={() => setValue(`${h}:${minute}`)}
                className={`w-full py-1.5 text-sm font-semibold tabular-nums transition-colors ${
                  h === hour
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="w-px bg-white/10" />

          {/* Minuty */}
          <div
            ref={minuteListRef}
            className="w-16 h-56 overflow-y-auto py-2"
          >
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                data-value={m}
                onClick={() => setValue(`${hour}:${m}`)}
                className={`w-full py-1.5 text-sm font-semibold tabular-nums transition-colors ${
                  m === minute
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}