'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Check, Plus, Settings } from 'lucide-react';
import { setActiveDruzyna } from '@/lib/druzyny-actions';

type Druzyna = {
  id: string;
  nazwa: string;
  rocznik: number | null;
  kolor: string;
  logo_url?: string | null;
};

const KOLORY: Record<string, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  slate: 'bg-slate-500',
};

export function DruzynaSwitcher({
  druzyny,
  activeId,
  zawodnicyCount = {},
}: {
  druzyny: Druzyna[];
  activeId: string;
  zawodnicyCount?: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const active = druzyny.find((d) => d.id === activeId) ?? druzyny[0];
  const activeColor = KOLORY[active?.kolor ?? 'green'] ?? KOLORY.green;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

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
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (id: string) => {
    if (id === activeId) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await setActiveDruzyna(id);
      setOpen(false);
      router.refresh();
    });
  };

  if (!active) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border transition-all flex-shrink-0 max-w-[160px] md:max-w-[220px] ${
          open
            ? 'bg-white/10 border-white/25 ring-2 ring-green-400/30'
            : 'border-white/10 hover:border-white/20'
        } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
        aria-label="Zmień drużynę"
      >
        {/* Zamiast logo - wracamy do kolorowej kropki */}
        <span className={`w-2.5 h-2.5 rounded-full ${activeColor} flex-shrink-0`} />
        
        <span className="text-xs font-semibold text-white/90 whitespace-nowrap truncate">
          {active.nazwa}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/50 flex-shrink-0 transition-transform ${
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
              right: `${coords.right}px`,
              zIndex: 9999,
            }}
            className="w-64 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-white/10 bg-slate-900">
              <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">
                Twoje drużyny
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto bg-slate-900">
              {druzyny.map((d) => {
                const color = KOLORY[d.kolor] ?? KOLORY.green;
                const isActive = d.id === activeId;
                const count = zawodnicyCount[d.id] ?? 0;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect(d.id)}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
                  >
                    {/* W liście rozwijanej też wracamy do kropki */}
                    <span className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {d.nazwa}
                      </div>
                      <div className="text-[10px] text-white/40">
                        {count === 0 ? 'brak zawodników' : `${count} zawodników`}
                      </div>
                    </div>
                    {isActive && (
                      <Check
                        className="w-4 h-4 text-green-400 flex-shrink-0"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 bg-slate-900">
              <Link
                href="/druzyny"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
              >
                <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-3 h-3 text-white/60" />
                </div>
                <span className="text-xs font-semibold text-white/70">
                  Zarządzaj drużynami
                </span>
              </Link>
              <Link
                href="/druzyny/nowa"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors border-t border-white/5"
              >
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-green-400">Nowa drużyna</span>
              </Link>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}