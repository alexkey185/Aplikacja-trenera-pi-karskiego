'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const MIESIACE = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];
const DNI = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

const pad2 = (n: number) => String(n).padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstWeekdayMon = (y: number, m: number) => {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
};
const formatDisplay = (iso: string) => {
  if (!iso) return '';
  const d = parseISO(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
};

const PANEL_HEIGHT = 420; // przybliżona wysokość panelu

export function DatePicker({
  name,
  defaultValue,
  value: controlledValue,
  onChange,
  required,
  placeholder = 'Wybierz datę',
}: {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (iso: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = isControlled ? controlledValue : internalValue;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    placeAbove: false,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? parseISO(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const dzisISO = useMemo(() => {
    const d = new Date();
    return toISO(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateCoords();
    const onResize = () => updateCoords();
    const onScroll = () => updateCoords();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? PANEL_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < panelHeight + 20 && rect.top > panelHeight + 20;

    setCoords({
      top: placeAbove ? rect.top - panelHeight - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      placeAbove,
    });
  };

  const setValue = (iso: string) => {
    if (!isControlled) setInternalValue(iso);
    onChange?.(iso);
  };

  const selectDay = (d: number) => {
    const iso = toISO(viewYear, viewMonth, d);
    setValue(iso);
    setOpen(false);
  };

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const goToday = () => {
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    selectDay(d.getDate());
  };

  const wyczysc = () => {
    setValue('');
    setOpen(false);
  };

  const renderDni = () => {
    const cells: React.ReactNode[] = [];
    const firstDay = firstWeekdayMon(viewYear, viewMonth);
    const totalDays = daysInMonth(viewYear, viewMonth);
    const prevMonthDays = daysInMonth(viewYear, viewMonth - 1);

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      cells.push(
        <div
          key={`prev-${d}`}
          className="aspect-square flex items-center justify-center text-xs text-white/20"
        >
          {d}
        </div>
      );
    }

    for (let d = 1; d <= totalDays; d++) {
      const iso = toISO(viewYear, viewMonth, d);
      const isSelected = iso === value;
      const isToday = iso === dzisISO;
      cells.push(
        <button
          key={iso}
          type="button"
          onClick={() => selectDay(d)}
          className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
            isSelected
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/40'
              : isToday
              ? 'bg-green-500/15 text-green-400 border border-green-400/50'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          {d}
        </button>
      );
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push(
        <div
          key={`next-${d}`}
          className="aspect-square flex items-center justify-center text-xs text-white/20"
        >
          {d}
        </div>
      );
    }
    return cells;
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={value} required={required} />}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left py-2 text-white"
      >
        <span className={value ? 'font-semibold' : 'text-white/40'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/40 ml-auto flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
            className="bg-slate-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <div className="text-sm font-bold text-white">
                  {MIESIACE[viewMonth]} {viewYear}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">
                  {viewYear === new Date().getFullYear() && viewMonth === new Date().getMonth() ? 'Bieżący miesiąc' : ''}
                </div>
              </div>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 px-3 pt-3 pb-1">
              {DNI.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold text-white/40 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 px-3 pb-2">
              {renderDni()}
            </div>

            <div className="flex items-center justify-between p-3 border-t border-white/10 bg-slate-950/40">
              <button
                type="button"
                onClick={wyczysc}
                className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
              >
                Wyczyść
              </button>
              <button
                type="button"
                onClick={goToday}
                className="text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
              >
                Dziś
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}