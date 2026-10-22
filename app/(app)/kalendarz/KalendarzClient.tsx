'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Printer,
  Pencil,
  Trash2,
  Trophy,
  Flame,
  Target,
} from 'lucide-react';
import { przeniesTrening } from './actions';
import { CompactStat } from './CompactStat';
import { PanelMiesiaca } from './PanelMiesiaca';
import { ListaDnia } from './ListaDnia';
import { UpcomingRow } from './UpcomingRow';
import { TYP_CONFIG, MONTHS_PL, MONTHS_PL_GENITIVE, DAYS_SHORT, DAYS_LONG, HOLIDAYS } from './constants';
import { pad2, toISO, getLocalISO, parseISO, daysInMonth, firstWeekdayMon, formatShort, getMonday } from './utils';
import type { Trening, StatsMap } from './types';

const DeleteEventButton = dynamic(
  () => import('./DeleteEventButton').then((m) => m.DeleteEventButton),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-400/20 text-red-400/30 text-xs font-semibold"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Usuń</span>
      </button>
    ),
  }
);

type Props = {
  treningi: Trening[];
  stats: StatsMap;
  topBar: React.ReactNode;
};

// Odmiana słowa "wydarzenie" — polska gramatyka
function liczbaSlowo(n: number): string {
  if (n === 1) return 'wydarzenie';
  if (n >= 2 && n <= 4) return 'wydarzenia';
  return 'wydarzeń';
}

const typIkona = (typ: string) => {
  if (typ === 'mecz') return Trophy;
  if (typ === 'sparing') return Flame;
  if (typ === 'turniej') return Target;
  return CalendarIcon;
};

const typBorder = (typ: string) => {
  if (typ === 'mecz') return 'border-l-red-500';
  if (typ === 'sparing') return 'border-l-orange-500';
  if (typ === 'turniej') return 'border-l-purple-500';
  return 'border-l-blue-500';
};

export function KalendarzClient({ treningi, stats, topBar }: Props) {
  const router = useRouter();
  const todayISO = useMemo(() => getLocalISO(), []);
  const todayDate = useMemo(() => parseISO(todayISO), [todayISO]);

  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [toast, setToast] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  const calendarRef = useRef<HTMLDivElement>(null);
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
    if (iso === selectedDate) return;
    setSelectedDate(iso);
    setFlashKey((k) => k + 1);
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
      if (Math.abs(delta) > 60) changeMonth(delta > 0 ? -1 : 1);
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
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
    if (result?.error) showToast(`Błąd: ${result.error}`);
    else {
      showToast(`Przeniesiono na ${formatShort(iso)}`);
      setSelectedDate(iso);
      router.refresh();
    }
  };

  const eksportUrl = useMemo(() => {
    const monday = getMonday(parseISO(selectedDate));
    return `/kalendarz/eksport?w=${getLocalISO(monday)}`;
  }, [selectedDate]);

  const renderDayCell = (
    dayNum: number,
    otherMonth: boolean,
    iso: string | null
  ) => {
    if (otherMonth || !iso) {
      return (
        <div className="aspect-square lg:aspect-auto lg:h-16 rounded-lg border border-transparent flex flex-col items-center justify-center p-1 opacity-30">
          <div className="text-xs lg:text-sm text-white/40">{dayNum}</div>
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
      'aspect-square lg:aspect-auto lg:h-16 rounded-lg border flex flex-col items-center justify-center p-1 relative cursor-pointer transition-all select-none',
      isToday ? 'day-today' : '',
      isSelected && !isToday ? 'day-selected' : '',
      isWeekend && !isToday && !isSelected ? 'day-weekend' : '',
      isHoliday && !isToday && !isSelected ? 'day-holiday' : '',
      isDragOver ? 'bg-green-500/20 border-green-400/60' : '',
      !isToday && !isSelected ? 'border-transparent day-hoverable' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        onClick={() => selectDay(iso)}
        onDragOver={(e) => handleDragOver(e, iso)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, iso)}
        className={classes}
      >
        <div
          className={`text-xs lg:text-lg day-number ${
            isToday ? 'font-bold text-green-300' : 'text-white/80'
          }`}
        >
          {dayNum}
        </div>
        {isToday && (
          <div className="text-[7px] lg:text-[9px] day-label uppercase tracking-wider leading-none mt-0.5 hidden lg:block">
            Dziś
          </div>
        )}
        {events.length > 0 && (
          <div className="flex gap-0.5 lg:gap-1 mt-0.5 lg:mt-1 items-center">
            {events.slice(0, 3).map((e, i) => (
              <span
                key={i}
                className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full ${
                  TYP_CONFIG[e.typ]?.color ?? 'bg-slate-500'
                }`}
              />
            ))}
            {events.length > 3 && (
              <span
                className={`text-[7px] lg:text-[9px] font-bold ml-0.5 ${
                  isToday ? 'text-white' : 'text-white/60'
                }`}
              >
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
        <div key={`prev-${dayNum}`}>{renderDayCell(dayNum, true, null)}</div>
      );
    }

    for (let d = 1; d <= totalDays; d++) {
      const iso = toISO(viewYear, viewMonth, d);
      cells.push(<div key={iso}>{renderDayCell(d, false, iso)}</div>);
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push(
        <div key={`next-${d}`}>{renderDayCell(d, true, null)}</div>
      );
    }

    return cells;
  };

  const selectedDateObj = parseISO(selectedDate);
  const selectedDayLabel = DAYS_LONG[selectedDateObj.getDay()];
  const selectedMonthLabel = MONTHS_PL_GENITIVE[selectedDateObj.getMonth()];
  const pierwszeWydarzenie = selectedEvents[0] ?? null;
  const pokazListeDnia = selectedEvents.length > 1;
  const liczbaWydarzen = selectedEvents.length;

  // Renderowanie pojedynczego wiersza wydarzenia (gdy > 1)
  const renderEventRow = (t: Trening) => {
    const Icon = typIkona(t.typ);
    return (
      <div
        key={t.id}
        className={`flex items-center gap-2 p-2 rounded-xl border-l-4 ${typBorder(t.typ)} bg-white/5 hover:bg-white/10 transition-all`}
      >
        <Link
          href={`/kalendarz/${t.id}/obecnosc`}
          className="flex-1 flex items-center gap-2 min-w-0"
          title="Otwórz obecność"
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-shrink-0 text-xs font-bold text-white tabular-nums">
            {t.godzina}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white truncate capitalize">
              {TYP_CONFIG[t.typ]?.label}
              {t.przeciwnik && <span className="text-white/60"> vs {t.przeciwnik}</span>}
            </div>
            {t.miejsce && (
              <div className="text-[10px] text-white/50 truncate">{t.miejsce}</div>
            )}
          </div>
        </Link>
        <Link
          href={`/kalendarz/${t.id}/edytuj`}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all flex-shrink-0"
          title="Edytuj"
        >
          <Pencil className="w-3 h-3" />
        </Link>
        <DeleteEventButton id={t.id} cyklId={t.cykl_id} size="sm" />
        <Link
          href={`/kalendarz/${t.id}/obecnosc`}
          className="w-5 h-5 text-white/40 hover:text-green-400 transition-all flex-shrink-0"
          title="Przejdź do obecności"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  };

  // Lewy obszar kafla (klikalny)
  const lewyObszar = (
    <>
      <div className="relative flex-shrink-0">
        <div
          className={`absolute inset-0 rounded-2xl blur-md opacity-60 ${
            isTodaySelected
              ? 'bg-gradient-to-br from-green-400 to-green-700'
              : 'bg-gradient-to-br from-blue-400 to-blue-700'
          }`}
        />
        <div
          className={`relative w-12 h-12 lg:w-11 lg:h-11 rounded-2xl flex items-center justify-center shadow-lg ${
            isTodaySelected
              ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-700'
              : 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700'
          }`}
        >
          <span className="text-white font-black text-lg">
            {isTodaySelected ? '!' : 'D'}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1 lg:mb-0.5 flex-wrap">
          <span
            className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest ${
              isTodaySelected ? 'text-green-400' : 'text-blue-400'
            }`}
          >
            {isTodaySelected ? 'Dzisiaj' : selectedDayLabel}
          </span>
          <span className="text-[10px] lg:text-xs text-white/50 capitalize">
            · {selectedDateObj.getDate()} {selectedMonthLabel}
            {selectedDateObj.getFullYear() !== todayDate.getFullYear() &&
              ` ${selectedDateObj.getFullYear()}`}
          </span>
          {liczbaWydarzen > 0 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isTodaySelected
                  ? 'bg-green-500/20 text-green-300 border border-green-400/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
              }`}
            >
              {liczbaWydarzen} {liczbaSlowo(liczbaWydarzen)}
            </span>
          )}
        </div>
        {selectedEvents.length > 0 ? (
          <div className="text-xs lg:text-sm text-white/70 mt-0.5 truncate font-medium">
            {TYP_CONFIG[selectedEvents[0].typ]?.label}
            {selectedEvents[0].przeciwnik && ` vs ${selectedEvents[0].przeciwnik}`}
            {selectedEvents[0].miejsce && ` · ${selectedEvents[0].miejsce}`}
          </div>
        ) : (
          <div className="text-xs lg:text-sm text-white/50 mt-0.5">
            {isTodaySelected ? 'Nic nie zaplanowano na dziś' : 'Nic nie zaplanowano na ten dzień'}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="w-full max-w-2xl lg:max-w-screen-2xl mx-auto lg:h-full lg:flex lg:flex-col">
      <header className="mb-5 lg:mb-4 flex items-center gap-3 animate-fadeIn flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-5 h-5 lg:w-5 lg:h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-2xl font-bold leading-tight text-white drop-shadow-lg">
              Kalendarz
            </h1>
            <p className="text-xs lg:text-sm text-white/70 font-medium mt-0.5 drop-shadow">
              {monthStats.total} {monthStats.total === 1 ? 'wydarzenie' : 'wydarzeń'} w tym miesiącu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href={eksportUrl}
            className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-xs lg:text-sm font-semibold transition-all flex-shrink-0"
            title="Eksportuj plan tygodnia"
          >
            <Printer className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Eksport</span>
          </Link>
          {topBar}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-5 lg:flex-1 lg:min-h-0">
        <div className="lg:col-span-3 lg:flex lg:flex-col lg:gap-4 min-w-0 lg:min-h-0 space-y-4 lg:space-y-0">
          {/* Kafel dnia */}
          <div
            key={flashKey}
            className={`rounded-2xl p-4 lg:p-4 transition-all flex-shrink-0 animate-flash ${
              isTodaySelected
                ? 'bg-gradient-to-br from-green-500/25 via-green-600/15 to-green-700/5 border border-green-400/50 shadow-lg shadow-green-500/20'
                : 'bg-gradient-to-br from-blue-500/15 via-slate-900/60 to-slate-900/80 border border-blue-400/30'
            }`}
          >
            <div className="flex items-center gap-3 lg:gap-3">
              {pierwszeWydarzenie ? (
                <Link
                  href={`/kalendarz/${pierwszeWydarzenie.id}/obecnosc`}
                  className="flex items-center gap-3 lg:gap-3 flex-1 min-w-0 text-left hover:opacity-90 transition-opacity"
                  title="Otwórz obecność"
                >
                  {lewyObszar}
                </Link>
              ) : (
                <button
  onClick={handleFabClick}
  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 hover:border-green-400/50 text-green-300 hover:text-green-200 text-[11px] font-semibold transition-all hover:shadow-lg hover:shadow-green-500/20"
>
  <Plus className="w-3.5 h-3.5" />
  Dodaj kolejne wydarzenie
</button>
              )}

              {/* Akcje dla 1 wydarzenia (na górze) - gdy jest ich więcej, są w liście poniżej */}
              <div className="flex flex-col md:flex-row items-center gap-2 flex-shrink-0">
                {liczbaWydarzen === 1 && pierwszeWydarzenie && (
                  <>
                    <Link
                      href={`/kalendarz/${pierwszeWydarzenie.id}/edytuj`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-blue-500/15 border border-white/10 hover:border-blue-400/40 text-white/70 hover:text-blue-300 text-xs font-semibold transition-all"
                      title="Edytuj wydarzenie"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Edytuj</span>
                    </Link>
                    <DeleteEventButton
                      id={pierwszeWydarzenie.id}
                      cyklId={pierwszeWydarzenie.cykl_id}
                      variant="tile"
                    />
                  </>
                )}
                {liczbaWydarzen === 0 && (
                  <button
                    onClick={handleFabClick}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-xs font-bold transition-all shadow-lg shadow-green-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Dodaj</span>
                  </button>
                )}
              </div>
            </div>

            {/* Lista wszystkich wydarzeń (gdy > 1) */}
            {liczbaWydarzen > 1 && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                {selectedEvents.map(renderEventRow)}
                <button
                  onClick={handleFabClick}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-white/50 hover:text-white text-[11px] font-semibold transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Dodaj kolejne wydarzenie
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 lg:gap-3 animate-fadeIn flex-shrink-0">
            <CompactStat icon={CalendarIcon} color="text-blue-400" bg="from-blue-500/20 to-blue-700/10" border="border-blue-400/30" label="Treningi" value={monthStats.treningi} />
            <CompactStat icon={Trophy} color="text-red-400" bg="from-red-500/20 to-red-700/10" border="border-red-400/30" label="Mecze" value={monthStats.mecze} />
            <CompactStat icon={Flame} color="text-orange-400" bg="from-orange-500/20 to-orange-700/10" border="border-orange-400/30" label="Sparingi" value={monthStats.sparingi} />
            <CompactStat icon={Target} color="text-purple-400" bg="from-purple-500/20 to-purple-700/10" border="border-purple-400/30" label="Turnieje" value={monthStats.turnieje} />
          </div>

          <div
            ref={calendarRef}
            className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-6 animate-fadeIn shadow-2xl shadow-black/60 lg:flex-1 lg:flex lg:flex-col lg:min-h-0"
          >
            <div className="flex items-center justify-between mb-4 lg:mb-5 flex-shrink-0">
              <button
                onClick={() => changeMonth(-1)}
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <div className="text-center">
                <div className="font-bold text-white text-sm lg:text-lg">
                  {MONTHS_PL[viewMonth]} {viewYear}
                </div>
                {viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth() && (
                  <div className="text-[10px] lg:text-xs text-green-400 font-bold uppercase tracking-widest">
                    Bieżący miesiąc
                  </div>
                )}
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95"
              >
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>

            <div className="lg:hidden flex items-center justify-center gap-2 mb-3 text-white/30 text-[10px]">
              <span>←</span>
              <span className="uppercase tracking-widest">przesuń palcem</span>
              <span>→</span>
            </div>

            <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-1 lg:mb-2 flex-shrink-0">
              {DAYS_SHORT.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] lg:text-xs font-bold text-white/40 uppercase tracking-widest py-0.5 lg:py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 lg:gap-2 lg:flex-1 lg:min-h-0 lg:auto-rows-fr">
              {renderMonthGrid()}
            </div>

            <div className="flex items-center justify-center gap-4 lg:gap-6 mt-5 lg:mt-4 pt-4 lg:pt-3 border-t border-white/10 text-[10px] lg:text-xs flex-wrap flex-shrink-0">
              {Object.entries(TYP_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 lg:gap-2">
                  <span className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${cfg.color}`} />
                  <span className="text-white/60">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 lg:flex lg:flex-col lg:gap-4 min-w-0 lg:min-h-0 lg:overflow-y-auto space-y-4 lg:space-y-0">
          {pokazListeDnia ? (
            <ListaDnia
              selectedDate={selectedDate}
              todayISO={todayISO}
              events={selectedEvents}
              stats={stats}
              onAddClick={handleFabClick}
              onDragStart={handleDragStart}
              draggedId={draggedId}
            />
          ) : (
            <PanelMiesiaca
              monthStats={monthStats}
              monthLabel={`${MONTHS_PL[viewMonth]} ${viewYear}`}
              treningi={treningi}
              stats={stats}
              monthPrefix={monthPrefix}
              onAddClick={handleFabClick}
            />
          )}

          {upcoming.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-4 animate-fadeIn shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 mb-4 lg:mb-3">
                <span className="text-white/40 text-sm">+</span>
                <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">
                  Najbliższe 3 wydarzenia
                </h2>
              </div>
              <div className="space-y-2">
                {upcoming.map((t) => (
                  <UpcomingRow key={t.id} trening={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleFabClick}
        className="group fixed bottom-24 right-5 md:bottom-6 md:right-6 z-40 w-14 h-14 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center justify-center text-white shadow-2xl shadow-green-500/50 hover:shadow-green-400/70 transition-all hover:scale-110 active:scale-95 animate-glow"
        title="Dodaj wydarzenie"
      >
        <Plus className="w-7 h-7 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" strokeWidth={2.5} />
      </button>

      {toast && (
        <div className="fixed bottom-40 right-5 md:bottom-20 md:right-6 z-50 bg-slate-900/95 backdrop-blur-md border border-green-400/40 rounded-xl px-4 py-2.5 text-xs text-white shadow-xl animate-fadeIn">
          {toast}
        </div>
      )}
    </div>
  );
}