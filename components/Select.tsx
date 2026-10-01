'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type Opcja = { value: string; label: string };

export function Select({
  name,
  options,
  defaultValue,
  value: controlledValue,
  onChange,
  placeholder = 'Wybierz...',
}: {
  name?: string;
  options: Opcja[];
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = isControlled ? controlledValue : internalValue;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const wybrana = options.find((o) => o.value === value);

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

  const selectValue = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left py-2 text-white"
      >
        <span className={wybrana ? 'font-semibold' : 'text-white/40'}>
          {wybrana?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/40 ml-auto flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50">
          <div className="max-h-72 overflow-y-auto">
            {options.map((o) => {
              const isSelected = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => selectValue(o.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                    isSelected
                      ? 'bg-green-500/10 border-l-2 border-green-500'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`flex-1 text-sm font-semibold ${
                      isSelected ? 'text-green-400' : 'text-white/90'
                    }`}
                  >
                    {o.label}
                  </span>
                  {isSelected && (
                    <Check
                      className="w-4 h-4 text-green-400 flex-shrink-0"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}