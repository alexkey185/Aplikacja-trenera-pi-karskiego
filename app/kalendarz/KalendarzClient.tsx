'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Trash2,
} from 'lucide-react';
import { przeniesTrening } from './actions';
import { usunTrening } from './[id]/edytuj/actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// ══════════════════════════════════════════════
// TYPY
// ══════════════════════════════════════════════
type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
};

type StatsMap = Record<number, { obecni: number; nieobecni: number; total: number }>;

type Props = {
  treningi: Trening[];
  stats: StatsMap;
};

// ══════════════════════════════════════════════
// STALE
// ══════════════════════════════════════════════
const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];

const MONTHS_PL_GENITIVE = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];

const DAYS_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

const DAYS_LONG = [
  'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa',
  'Czwartek', 'Piątek', 'Sobota',
];

const HOLIDAYS = new Set([
  '2026-01-01', '2026-01-06', '2026-04-06', '2026-05-01', '2026-05-03',
  '2026-06-04', '2026-08-15', '2026-11-01', '2026-11-11',
  '2026-12-25', '2026-12-26',
]);

const TYP_CONFIG: Record<string, {
  color: string;
  gradient: string;
  icon: string;
  label: string;
}> = {
  trening: {
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    icon: '📅',
    label: 'Trening',
  },
  mecz: {
    color: 'bg-red-500',
    gradient: 'from-red-400 to-red-600',
    icon: '🏆',
    label: 'Mecz',
  },
  sparing: {
    color: 'bg-orange-500',
    gradient: 'from-orange-400 to-orange-600',
    icon: '🔥',
    label: 'Sparing',
  },
  turniej: {
    color: 'bg-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    icon: '🎯',
    label: 'Turniej',
  },
};

// ══════════════════════════════════════════════
// HELPERY DATY
// ══════════════════════════════════════════════
const pad2 = (n: number) => String(n).padStart(2, '0');

const toISO = (y: number, m: number, d: number) =>
  `${y}-${pad2(m + 1)}-${pad2(d)}`;

const getLocalISO = (date: Date = new Date()) =>
  toISO(date.getFullYear(), date.getMonth(), date.getDate());

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const daysInMonth = (y: number, m: number) =>
  new Date(y, m + 1, 0).getDate();

const firstWeekdayMon = (y: number, m: number) => {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

const formatShort = (iso: string) => {
  const d = parseISO(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
};

// ══════════════════════════════════════════════
// KOMPONENT
// ══════════════════════════════════════════════
export function KalendarzClient({ treningi, stats }: Props) {
  const router = useRouter();
  const todayISO = useMemo(() => getLocalISO(), []);
  const todayDate = useMemo(() => parseISO(todayISO), [todayISO]);

  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [toast, setToast] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const calendarRef = useRef<HTMLDivElement>(null);
  const eventsAnchorRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Trening[]> = {};
    treningi.forEach((t) => {
      if (!map[t.data]) map[t.data] = [];
      map[t.data].push(t);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.godzina.localeCompare(b.godzina))
    );
    return map;
  }, [treningi]);

  const monthPrefix = `${viewYear}-${pad2(viewMonth + 1)}`;
  const monthStats = useMemo(() => {
    const inMonth = treningi.filter((t) => t.data.startsWith(monthPrefix));
    const liczbaTypu = (typ: string) => inMonth.filter((t) => t.typ === typ).length;
    return {
      treningi: liczbaTypu('trening'),
      mecze: liczbaTypu('mecz'),
      sparingi: liczbaTypu('sparing'),
      turnieje: liczbaTypu('turniej'),
      total: inMonth.length,
    };
  }, [treningi, monthPrefix]);

  const selectedEvents = eventsByDate[selectedDate] ?? [];
  const todayEvents = eventsByDate[todayISO] ?? [];
  const isTodaySelected = selectedDate === todayISO;

  const upcoming = useMemo(() => {
    return treningi
      .filter((t) => t.data >= todayISO)
      .sort((a, b) => {
        const cmp = a.data.localeCompare(b.data);
        if (cmp !== 0) return cmp;
        return a.godzina.localeCompare(b.godzina);
      })
      .slice(0, 3);
  }, [treningi, todayISO]);

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const selectDay = (iso: string) => {
    setSelectedDate(iso);
    setTimeout(() => {
      eventsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const goToToday = () => {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
    selectDay(todayISO);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleFabClick = () => {
    router.push(`/kalendarz/nowy?data=${selectedDate}`);
  };

  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 60) {
        changeMonth(delta > 0 ? -1 : 1);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMonth, viewYear]);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
  };

  const handleDragOver = (e: React.DragEvent, iso: string) => {
    e.preventDefault();
    if (dragOverDate !== iso) setDragOverDate(iso);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, iso: string) => {
    e.preventDefault();
    setDragOverDate(null);
    if (draggedId == null) return;

    const id = draggedId;
    setDraggedId(null);

    const result = await przeniesTrening(id, iso);
    if (result?.error) {
      showToast(`Błąd: ${result.error}`);
    } else {
      showToast(`Przeniesiono na ${formatShort(iso)}`);
      setSelectedDate(iso);
      router.refresh();
    }
  };

  // ══════════════════════════════════════════════
  // RENDER KOMÓRKI DNIA
  // ══════════════════════════════════════════════
  const renderDayCell = (dayNum: number, otherMonth: boolean, iso: string | null) => {
    if (otherMonth || !iso) {
      return (
        <div className="aspect-square rounded-lg border border-transparent flex flex-col items-center justify-center p-1 opacity-30">
          <div className="text-xs text-white/40">{dayNum}</div>
        </div>
      );
    }

    const dateObj = parseISO(iso);
    const dayOfWeek = dateObj.getDay();
    const isToday = iso === todayISO;
    const isSelected = iso === selectedDate;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = HOLIDAYS.has(iso);
    const isDragOver = dragOverDate === iso;

    const events = eventsByDate[iso] ?? [];

    const classes = [
      'aspect-square rounded-lg border flex flex-col items-center justify-center p-1 relative cursor-pointer transition-all select-none',
      isToday ? 'day-today' : '',
      isSelected && !isToday ? 'day-selected' : '',
      isWeekend && !isToday && !isSelected ? 'day-weekend' : '',
      isHoliday && !isToday && !isSelected ? 'day-holiday' : '',
      isDragOver ? 'bg-green-500/20 border-green-400/60' : '',
      !isToday && !isSelected ? 'border-transparent day-hoverable' : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        onClick={() => selectDay(iso)}
        onDragOver={(e) => handleDragOver(e, iso)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, iso)}
        className={classes}
      >
        {isHoliday && (
          <div className="absolute top-0.5 right-0.5 text-[8px]">🎉</div>
        )}

        <div className={`text-xs day-number ${isToday ? 'font-bold text-green-300' : 'text-white/80'}`}>
          {dayNum}
        </div>

        {isToday && (
          <div className="text-[7px] day-label uppercase tracking-wider leading-none mt-0.5">
            Dziś
          </div>
        )}

        {events.length > 0 && (
          <div className="flex gap-0.5 mt-0.5 items-center">
            {events.slice(0, 3).map((e, i) => (
              <span
                key={i}
                className={`w-1 h-1 rounded-full ${TYP_CONFIG[e.typ]?.color ?? 'bg-slate-500'}`}
              />
            ))}
            {events.length > 3 && (
              <span className={`text-[7px] font-bold ml-0.5 ${isToday ? 'text-white' : 'text-white/60'}`}>
                +{events.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMonthGrid = () => {
    const cells: React.ReactNode[] = [];
    const firstDay = firstWeekdayMon(viewYear, viewMonth);
    const totalDays = daysInMonth(viewYear, viewMonth);
    const prevMonthDays = daysInMonth(viewYear, viewMonth - 1);

    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      cells.push(
        <div key={`prev-${dayNum}`}>
          {renderDayCell(dayNum, true, null)}
        </div>
      );
    }

    for (let d = 1; d <= totalDays; d++) {
      const iso = toISO(viewYear, viewMonth, d);
      cells.push(
        <div key={iso}>{renderDayCell(d, false, iso)}</div>
      );
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push(
        <div key={`next-${d}`}>
          {renderDayCell(d, true, null)}
        </div>
      );
    }

    return cells;
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 lg:p-8 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-4 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white mb-1">Kalendarz</h1>
            <p className="text-xs text-white/60">
              {monthStats.total} {monthStats.total === 1 ? 'wydarzenie' : 'wydarzeń'} w tym miesiącu
            </p>
          </header>

          <button
            onClick={goToToday}
            className={`w-full text-left rounded-2xl p-4 mb-5 transition-all animate-fadeIn group ${
              isTodaySelected
                ? 'bg-gradient-to-br from-green-500/25 via-green-600/15 to-green-700/5 border border-green-400/50 shadow-lg shadow-green-500/20'
                : 'bg-slate-900/80 backdrop-blur-md border border-green-400/20 hover:border-green-400/40 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-md opacity-60 animate-pulse" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
                  <span className="text-xl">⚡</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                    Dzisiaj
                  </span>
                  <span className="text-[10px] text-white/50 capitalize">
                    · {todayDate.getDate()} {MONTHS_PL_GENITIVE[todayDate.getMonth()]}
                  </span>
                </div>
                {todayEvents.length > 0 ? (
                  <>
                    <div className="text-white font-bold text-base leading-tight">
                      {todayEvents.length === 1
                        ? '1 wydarzenie'
                        : `${todayEvents.length} wydarzenia`}
                      <span className="text-white/60 font-normal"> · pierwsze o </span>
                      <span className="text-green-300 font-bold">
                        {todayEvents[0].godzina}
                      </span>
                    </div>
                    <div className="text-xs text-white/60 mt-0.5 truncate">
                      {TYP_CONFIG[todayEvents[0].typ]?.icon} {TYP_CONFIG[todayEvents[0].typ]?.label}
                      {todayEvents[0].przeciwnik && ` vs ${todayEvents[0].przeciwnik}`}
                      {todayEvents[0].miejsce && ` · ${todayEvents[0].miejsce}`}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-white font-bold text-base leading-tight">
                      Brak wydarzeń
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      Nic nie zaplanowano na dziś
                    </div>
                  </>
                )}
              </div>
              {!isTodaySelected && (
                <div className="text-green-400/60 text-xs font-semibold uppercase tracking-wider flex-shrink-0 group-hover:text-green-400 transition-colors">
                  Pokaż →
                </div>
              )}
            </div>
          </button>

          <div className="grid grid-cols-4 gap-2 mb-5 animate-fadeIn">
            <StatBox icon="📅" color="text-blue-400" border="border-blue-400/30" value={monthStats.treningi} label="Treningi" />
            <StatBox icon="🏆" color="text-red-400" border="border-red-400/30" value={monthStats.mecze} label="Mecze" />
            <StatBox icon="🔥" color="text-orange-400" border="border-orange-400/30" value={monthStats.sparingi} label="Sparingi" />
            <StatBox icon="🎯" color="text-purple-400" border="border-purple-400/30" value={monthStats.turnieje} label="Turnieje" />
          </div>

          <div
            ref={calendarRef}
            className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 mb-5 animate-fadeIn"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeMonth(-1)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <div className="font-bold text-white">
                  {MONTHS_PL[viewMonth]} {viewYear}
                </div>
                {viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth() && (
                  <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest">
                    Bieżący miesiąc
                  </div>
                )}
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="md:hidden flex items-center justify-center gap-2 mb-3 text-white/30 text-[10px]">
              <span>←</span>
              <span className="uppercase tracking-widest">przesuń palcem</span>
              <span>→</span>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderMonthGrid()}
            </div>

            <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-white/10 text-[10px] flex-wrap">
              {Object.entries(TYP_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                  <span className="text-white/60">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={eventsAnchorRef} className="scroll-mt-4" />

          <SelectedDayView
            selectedDate={selectedDate}
            todayISO={todayISO}
            events={selectedEvents}
            stats={stats}
            onAddClick={handleFabClick}
            onDragStart={handleDragStart}
            draggedId={draggedId}
          />

          {upcoming.length > 0 && (
            <details className="mt-6 animate-fadeIn" open>
              <summary className="flex items-center gap-2 mb-4 cursor-pointer list-none">
                <span className="text-white/40">📌</span>
                <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Najbliższe 3 wydarzenia
                </h2>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/40 text-xs">▼</span>
              </summary>
              <div className="space-y-2">
                {upcoming.map((t) => (
                  <UpcomingRow key={t.id} trening={t} />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      <button
        onClick={handleFabClick}
        className="group fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center justify-center text-white shadow-2xl shadow-green-500/50 hover:shadow-green-400/70 transition-all hover:scale-110 active:scale-95 animate-glow"
        title="Dodaj wydarzenie"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" strokeWidth={2.5} />
      </button>

      {toast && (
        <div className="fixed bottom-40 right-5 md:bottom-24 md:right-8 z-50 bg-slate-900/95 backdrop-blur-md border border-green-400/40 rounded-xl px-4 py-2.5 text-xs text-white shadow-xl animate-fadeIn">
          {toast}
        </div>
      )}
    </main>
  );
}

// ══════════════════════════════════════════════
// SUB-KOMPONENTY
// ══════════════════════════════════════════════

function StatBox({
  icon,
  color,
  border,
  value,
  label,
}: {
  icon: string;
  color: string;
  border: string;
  value: number;
  label: string;
}) {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-md border ${border} rounded-xl p-2.5 text-center`}>
      <div className={`${color} text-sm mb-1`}>{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-[9px] text-white/60 uppercase tracking-wider font-semibold">
        {label}
      </div>
    </div>
  );
}

/**
 * Kosz — teraz wewnątrz karty, obok chevronu.
 * Dzięki e.preventDefault() + e.stopPropagation()
 * kliknięcie nie przenosi do /obecnosc.
 */
function DeleteEventButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={usunTrening} className="hidden">
        <input type="hidden" name="id" value={id} />
      </form>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/40 flex items-center justify-center text-white/40 hover:text-red-400 transition-all"
        title="Usuń wydarzenie"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <ConfirmDialog
        open={open}
        title="Usunąć to wydarzenie?"
        message={
          <>
            Usuną się też wszystkie wpisy obecności dla tego treningu.
            <br />
            <br />
            <span style={{ color: '#f87171' }}>Tej operacji nie można cofnąć.</span>
          </>
        }
        confirmLabel="Usuń"
        variant="danger"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          formRef.current?.requestSubmit();
          setOpen(false);
        }}
      />
    </>
  );
}

function EventCard({
  trening,
  stats,
  onDragStart,
  isDragging,
}: {
  trening: Trening;
  stats: StatsMap;
  onDragStart?: (e: React.DragEvent, id: number) => void;
  isDragging?: boolean;
}) {
  const cfg = TYP_CONFIG[trening.typ] ?? TYP_CONFIG.trening;
  const s = stats[trening.id];
  const proc = s && s.total > 0 ? Math.round((s.obecni / s.total) * 100) : 0;

  return (
    <div
      className={`group relative bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-2xl transition-all hover:bg-slate-900 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Główna treść karty — link do /obecnosc */}
      <Link
        href={`/kalendarz/${trening.id}/obecnosc`}
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart?.(e, trening.id)}
        className="block p-3"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg text-xl flex-shrink-0`}>
            {cfg.icon}
          </div>
          <div className="flex-shrink-0 w-14">
            <div className="text-lg font-bold text-white">{trening.godzina}</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex-1 min-w-0 pr-20">
            <div className="font-semibold text-white text-sm">
              {cfg.label}
              {trening.przeciwnik && (
                <span className="text-white/60 font-medium"> vs {trening.przeciwnik}</span>
              )}
            </div>
            {trening.miejsce ? (
              <div className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{trening.miejsce}</span>
              </div>
            ) : (
              <div className="text-xs text-white/50 mt-0.5">Brak lokalizacji</div>
            )}
            {s && s.total > 0 ? (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-white/60">
                  👥 {s.obecni}/{s.total} obecnych
                </span>
                <div className="flex-1 max-w-[80px] h-1 bg-slate-950/60 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${proc}%` }} />
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-white/40 mt-1.5">Brak wpisów obecności</div>
            )}
          </div>
        </div>
      </Link>

      {/* Akcje — kosz + chevron, absolutnie po prawej, wyśrodkowane pionowo */}
      <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1.5 pointer-events-none">
        <div className="pointer-events-auto">
          <DeleteEventButton id={trening.id} />
        </div>
        <ChevronRight className="w-5 h-5 text-white/40 transition-all flex-shrink-0" />
      </div>
    </div>
  );
}

function SelectedDayView({
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
    <>
      <div className="mb-4 flex items-center justify-between px-1 animate-fadeIn">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black text-white">{pad2(dateObj.getDate())}</div>
          <div>
            <div className="text-sm font-bold text-white/90">{DAYS_LONG[dateObj.getDay()]}</div>
            <div className="text-xs text-white/50 capitalize">
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

      {events.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-4 text-2xl">
            📅
          </div>
          <h3 className="font-bold text-base text-white mb-1">Brak wydarzeń</h3>
          <p className="text-xs text-white/50 mb-5">Nic nie zaplanowano na ten dzień.</p>
          <button
            onClick={onAddClick}
            className="group inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/40"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Dodaj wydarzenie w tym dniu
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((t) => (
            <EventCard
              key={t.id}
              trening={t}
              stats={stats}
              onDragStart={onDragStart}
              isDragging={draggedId === t.id}
            />
          ))}
        </div>
      )}
    </>
  );
}

function UpcomingRow({ trening }: { trening: Trening }) {
  const cfg = TYP_CONFIG[trening.typ] ?? TYP_CONFIG.trening;
  const d = parseISO(trening.data);
  return (
    <Link
      href={`/kalendarz/${trening.id}/obecnosc`}
      className="group block bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-xl p-2.5 hover:bg-slate-900 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md text-base flex-shrink-0`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-bold text-white">
              {pad2(d.getDate())}.{pad2(d.getMonth() + 1)}
            </span>
            <span className="text-white/50">·</span>
            <span className="font-semibold text-white">{trening.godzina}</span>
            <span className="text-white/50">·</span>
            <span className="text-white/70 truncate">
              {cfg.label}
              {trening.przeciwnik && ` vs ${trening.przeciwnik}`}
            </span>
          </div>
          {trening.miejsce && (
            <div className="text-[10px] text-white/40 mt-0.5 truncate">
              📍 {trening.miejsce}
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-green-400 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}