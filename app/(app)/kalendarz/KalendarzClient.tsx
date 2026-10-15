'use client';

import { useState, useMemo, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Trash2,
  Pencil,
  Calendar as CalendarIcon,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { przeniesTrening } from './actions';
import { usunTreningZakres } from './[id]/edytuj/actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';

type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
};

type StatsMap = Record<number, { obecni: number; nieobecni: number; total: number }>;

type Props = {
  treningi: Trening[];
  stats: StatsMap;
  topBar: React.ReactNode;
};

const MONTHS_PL = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
const MONTHS_PL_GENITIVE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const DAYS_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
const DAYS_LONG = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

const HOLIDAYS = new Set(['2026-01-01', '2026-01-06', '2026-04-06', '2026-05-01', '2026-05-03', '2026-06-04', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25', '2026-12-26']);

const TYP_CONFIG: Record<string, { color: string; bg: string; border: string; gradient: string; icon: string; label: string }> = {
  trening: { color: 'bg-blue-500', bg: 'bg-blue-500/15', border: 'border-blue-400/40', gradient: 'from-blue-400 to-blue-600', icon: '🏃', label: 'Trening' },
  mecz: { color: 'bg-red-500', bg: 'bg-red-500/15', border: 'border-red-400/40', gradient: 'from-red-400 to-red-600', icon: '🏆', label: 'Mecz' },
  sparing: { color: 'bg-orange-500', bg: 'bg-orange-500/15', border: 'border-orange-400/40', gradient: 'from-orange-400 to-orange-600', icon: '🔥', label: 'Sparing' },
  turniej: { color: 'bg-purple-500', bg: 'bg-purple-500/15', border: 'border-purple-400/40', gradient: 'from-purple-400 to-purple-600', icon: '🎯', label: 'Turniej' },
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const getLocalISO = (date: Date = new Date()) => toISO(date.getFullYear(), date.getMonth(), date.getDate());
const parseISO = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstWeekdayMon = (y: number, m: number) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
const formatShort = (iso: string) => { const d = parseISO(iso); return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`; };

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

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

  const calendarRef = useRef<HTMLDivElement>(null);
  const eventsAnchorRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Trening[]> = {};
    treningi.forEach((t) => { if (!map[t.data]) map[t.data] = []; map[t.data].push(t); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.godzina.localeCompare(b.godzina)));
    return map;
  }, [treningi]);

  const monthPrefix = `${viewYear}-${pad2(viewMonth + 1)}`;
  const monthStats = useMemo(() => {
    const inMonth = treningi.filter((t) => t.data.startsWith(monthPrefix));
    const liczbaTypu = (typ: string) => inMonth.filter((t) => t.typ === typ).length;
    return { treningi: liczbaTypu('trening'), mecze: liczbaTypu('mecz'), sparingi: liczbaTypu('sparing'), turnieje: liczbaTypu('turniej'), total: inMonth.length };
  }, [treningi, monthPrefix]);

  const selectedEvents = eventsByDate[selectedDate] ?? [];
  const isTodaySelected = selectedDate === todayISO;

  const upcoming = useMemo(() => {
    return treningi.filter((t) => t.data >= todayISO).sort((a, b) => {
      const cmp = a.data.localeCompare(b.data);
      if (cmp !== 0) return cmp;
      return a.godzina.localeCompare(b.godzina);
    }).slice(0, 3);
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
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) {
      setTimeout(() => { eventsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
    }
  };

  const goToToday = () => {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
    selectDay(todayISO);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const handleFabClick = () => { router.push(`/kalendarz/nowy?data=${selectedDate}`); };

  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 60) changeMonth(delta > 0 ? -1 : 1);
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [viewMonth, viewYear]);

  const handleDragStart = (e: React.DragEvent, id: number) => { setDraggedId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(id)); };
  const handleDragOver = (e: React.DragEvent, iso: string) => { e.preventDefault(); if (dragOverDate !== iso) setDragOverDate(iso); };
  const handleDragLeave = () => { setDragOverDate(null); };

  const handleDrop = async (e: React.DragEvent, iso: string) => {
    e.preventDefault();
    setDragOverDate(null);
    if (draggedId == null) return;
    const id = draggedId;
    setDraggedId(null);
    const result = await przeniesTrening(id, iso);
    if (result?.error) showToast(`Błąd: ${result.error}`);
    else { showToast(`Przeniesiono na ${formatShort(iso)}`); setSelectedDate(iso); router.refresh(); }
  };

  const eksportUrl = useMemo(() => {
    const monday = getMonday(parseISO(selectedDate));
    return `/kalendarz/eksport?w=${getLocalISO(monday)}`;
  }, [selectedDate]);

  const renderDayCell = (dayNum: number, otherMonth: boolean, iso: string | null) => {
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
    ].filter(Boolean).join(' ');
    return (
      <div onClick={() => selectDay(iso)} onDragOver={(e) => handleDragOver(e, iso)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, iso)} className={classes}>
        {isHoliday && <div className="absolute top-0.5 right-0.5 text-[8px] lg:text-[10px]">🎉</div>}
        <div className={`text-xs lg:text-lg day-number ${isToday ? 'font-bold text-green-300' : 'text-white/80'}`}>{dayNum}</div>
        {isToday && <div className="text-[7px] lg:text-[9px] day-label uppercase tracking-wider leading-none mt-0.5 hidden lg:block">Dziś</div>}
        {events.length > 0 && (
          <div className="flex gap-0.5 lg:gap-1 mt-0.5 lg:mt-1 items-center">
            {events.slice(0, 3).map((e, i) => (<span key={i} className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full ${TYP_CONFIG[e.typ]?.color ?? 'bg-slate-500'}`} />))}
            {events.length > 3 && (<span className={`text-[7px] lg:text-[9px] font-bold ml-0.5 ${isToday ? 'text-white' : 'text-white/60'}`}>+{events.length - 3}</span>)}
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
      cells.push(<div key={`prev-${dayNum}`}>{renderDayCell(dayNum, true, null)}</div>);
    }
    for (let d = 1; d <= totalDays; d++) {
      const iso = toISO(viewYear, viewMonth, d);
      cells.push(<div key={iso}>{renderDayCell(d, false, iso)}</div>);
    }
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push(<div key={`next-${d}`}>{renderDayCell(d, true, null)}</div>);
    }
    return cells;
  };

  // ═══════════════════════════════════════════════════════════════
  // KAFEL GÓRNY - kontekstowy: pokazuje WYBRANY dzień, nie zawsze dziś
  // ═══════════════════════════════════════════════════════════════
  const selectedDateObj = parseISO(selectedDate);
  const selectedDayLabel = DAYS_LONG[selectedDateObj.getDay()];
  const selectedMonthLabel = MONTHS_PL_GENITIVE[selectedDateObj.getMonth()];

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
            <h1 className="text-xl md:text-2xl lg:text-2xl font-bold leading-tight text-white drop-shadow-lg">Kalendarz</h1>
            <p className="text-xs lg:text-sm text-white/70 font-medium mt-0.5 drop-shadow">
              {monthStats.total} {monthStats.total === 1 ? 'wydarzenie' : 'wydarzeń'} w tym miesiącu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href={eksportUrl} className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-xs lg:text-sm font-semibold transition-all flex-shrink-0" title="Eksportuj plan tygodnia">
            <Printer className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Eksport</span>
          </Link>
          {topBar}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-5 lg:flex-1 lg:min-h-0">
        <div className="lg:col-span-3 lg:flex lg:flex-col lg:gap-4 min-w-0 lg:min-h-0 space-y-4 lg:space-y-0">
          {/* ═══════════════════════════════════════════════════════════
              KAFEL DNIA - kontekstowy
              - Jeśli selected = today → "Dzisiaj" (zielony, klikalny by wrócić)
              - Jeśli selected != today → nazwa dnia + data (niebieski)
              ═══════════════════════════════════════════════════════════ */}
          <button
            onClick={goToToday}
            className={`w-full text-left rounded-2xl p-5 lg:p-4 transition-all animate-fadeIn flex-shrink-0 ${
              isTodaySelected
                ? 'bg-gradient-to-br from-green-500/25 via-green-600/15 to-green-700/5 border border-green-400/50 shadow-lg shadow-green-500/20'
                : 'bg-gradient-to-br from-blue-500/15 via-slate-900/60 to-slate-900/80 border border-blue-400/30 hover:border-blue-400/50 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center gap-4 lg:gap-3">
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 rounded-2xl blur-md opacity-60 animate-pulse ${
                  isTodaySelected
                    ? 'bg-gradient-to-br from-green-400 to-green-700'
                    : 'bg-gradient-to-br from-blue-400 to-blue-700'
                }`} />
                <div className={`relative w-12 h-12 lg:w-11 lg:h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                  isTodaySelected
                    ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-700'
                    : 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700'
                }`}>
                  <span className="text-xl lg:text-lg">{isTodaySelected ? '⚡' : '📅'}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1 lg:mb-0.5 flex-wrap">
                  <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest ${
                    isTodaySelected ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {isTodaySelected ? 'Dzisiaj' : selectedDayLabel}
                  </span>
                  <span className="text-[10px] lg:text-xs text-white/50 capitalize">
                    · {selectedDateObj.getDate()} {selectedMonthLabel}
                    {selectedDateObj.getFullYear() !== todayDate.getFullYear() && ` ${selectedDateObj.getFullYear()}`}
                  </span>
                </div>
                {selectedEvents.length > 0 ? (
                  <>
                    <div className="text-white font-bold text-base lg:text-base leading-tight">
                      {selectedEvents.length === 1 ? '1 wydarzenie' : `${selectedEvents.length} wydarzenia`}
                      <span className="text-white/60 font-normal"> · pierwsze o </span>
                      <span className={isTodaySelected ? 'text-green-300 font-bold' : 'text-blue-300 font-bold'}>
                        {selectedEvents[0].godzina}
                      </span>
                    </div>
                    <div className="text-xs lg:text-sm text-white/60 mt-1 lg:mt-0.5 truncate">
                      {TYP_CONFIG[selectedEvents[0].typ]?.icon} {TYP_CONFIG[selectedEvents[0].typ]?.label}
                      {selectedEvents[0].przeciwnik && ` vs ${selectedEvents[0].przeciwnik}`}
                      {selectedEvents[0].miejsce && ` · ${selectedEvents[0].miejsce}`}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-white font-bold text-base lg:text-base leading-tight">Brak wydarzeń</div>
                    <div className="text-xs lg:text-sm text-white/60 mt-1 lg:mt-0.5">
                      {isTodaySelected ? 'Nic nie zaplanowano na dziś' : 'Nic nie zaplanowano na ten dzień'}
                    </div>
                  </>
                )}
              </div>
              {!isTodaySelected && (
                <div className="hidden lg:flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                    Wróć do
                  </span>
                  <span className="text-xs text-blue-300 font-semibold">
                    Dzisiaj →
                  </span>
                </div>
              )}
            </div>
          </button>

          <div className="grid grid-cols-4 gap-2 lg:gap-3 animate-fadeIn flex-shrink-0">
            <CompactStat icon="🏃" color="text-blue-400" bg="from-blue-500/20 to-blue-700/10" border="border-blue-400/30" label="Treningi" value={monthStats.treningi} />
            <CompactStat icon="🏆" color="text-red-400" bg="from-red-500/20 to-red-700/10" border="border-red-400/30" label="Mecze" value={monthStats.mecze} />
            <CompactStat icon="🔥" color="text-orange-400" bg="from-orange-500/20 to-orange-700/10" border="border-orange-400/30" label="Sparingi" value={monthStats.sparingi} />
            <CompactStat icon="🎯" color="text-purple-400" bg="from-purple-500/20 to-purple-700/10" border="border-purple-400/30" label="Turnieje" value={monthStats.turnieje} />
          </div>

          <div ref={calendarRef} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-6 animate-fadeIn shadow-2xl shadow-black/60 lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
            <div className="flex items-center justify-between mb-4 lg:mb-5 flex-shrink-0">
              <button onClick={() => changeMonth(-1)} className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95"><ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" /></button>
              <div className="text-center">
                <div className="font-bold text-white text-sm lg:text-lg">{MONTHS_PL[viewMonth]} {viewYear}</div>
                {viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth() && (
                  <div className="text-[10px] lg:text-xs text-green-400 font-bold uppercase tracking-widest">Bieżący miesiąc</div>
                )}
              </div>
              <button onClick={() => changeMonth(1)} className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95"><ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" /></button>
            </div>

            <div className="lg:hidden flex items-center justify-center gap-2 mb-3 text-white/30 text-[10px]">
              <span>←</span><span className="uppercase tracking-widest">przesuń palcem</span><span>→</span>
            </div>

            <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-1 lg:mb-2 flex-shrink-0">
              {DAYS_SHORT.map((d) => (<div key={d} className="text-center text-[10px] lg:text-xs font-bold text-white/40 uppercase tracking-widest py-0.5 lg:py-1">{d}</div>))}
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
          <div ref={eventsAnchorRef} className="scroll-mt-4" />
          <SelectedDayView selectedDate={selectedDate} todayISO={todayISO} events={selectedEvents} stats={stats} onAddClick={handleFabClick} onDragStart={handleDragStart} draggedId={draggedId} />
          {upcoming.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-4 animate-fadeIn shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 mb-4 lg:mb-3">
                <span className="text-white/40 text-sm">📅</span>
                <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Najbliższe 3 wydarzenia</h2>
              </div>
              <div className="space-y-2">
                {upcoming.map((t) => (<UpcomingRow key={t.id} trening={t} />))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button onClick={handleFabClick} className="group fixed bottom-24 right-5 md:bottom-6 md:right-6 z-40 w-14 h-14 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center justify-center text-white shadow-2xl shadow-green-500/50 hover:shadow-green-400/70 transition-all hover:scale-110 active:scale-95 animate-glow" title="Dodaj wydarzenie">
        <Plus className="w-7 h-7 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" strokeWidth={2.5} />
      </button>

      {toast && (
        <div className="fixed bottom-40 right-5 md:bottom-20 md:right-6 z-50 bg-slate-900/95 backdrop-blur-md border border-green-400/40 rounded-xl px-4 py-2.5 text-xs text-white shadow-xl animate-fadeIn">{toast}</div>
      )}
    </div>
  );
}

function CompactStat({ icon, color, bg, border, label, value }: { icon: string; color: string; bg: string; border: string; label: string; value: number }) {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:px-4 lg:py-3 bg-gradient-to-br ${bg} border ${border} animate-fadeIn shadow-lg shadow-black/30 flex flex-col lg:flex-row lg:items-center lg:gap-3`}>
      <div className={`${color} text-base lg:text-2xl lg:flex-shrink-0`}>{icon}</div>
      <div className="lg:flex-1 lg:min-w-0">
        <div className="text-2xl lg:text-3xl font-bold text-white drop-shadow leading-tight">{value}</div>
        <div className="text-xs lg:text-xs text-white/60 lg:uppercase lg:tracking-wider lg:font-semibold mt-0.5 lg:mt-0 leading-tight">{label}</div>
      </div>
    </div>
  );
}

function DeleteEventButton({ id, cyklId }: { id: number; cyklId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<'single' | 'all'>('single');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isCyclic = !!cyklId;

  const handleDelete = () => {
    const finalScope = isCyclic ? scope : 'single';
    setOpen(false);
    startTransition(async () => {
      const result = await usunTreningZakres(id, finalScope);

      if ('error' in result) {
        toast.error('Nie udało się usunąć', {
          description: result.error,
        });
        return;
      }

      if (finalScope === 'all' && result.count > 1) {
        toast.success('Cała seria usunięta', {
          description: `Usunięto ${result.count} treningów z cyklu`,
        });
      } else {
        toast.success('Trening usunięty');
      }

      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        disabled={isPending}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/40 flex items-center justify-center text-white/40 hover:text-red-400 transition-all disabled:opacity-50"
        title="Usuń wydarzenie"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <ConfirmDialog
        open={open}
        title={isCyclic ? 'Usunąć z serii?' : 'Usunąć to wydarzenie?'}
        variant="danger"
        confirmLabel={isPending ? 'Usuwanie...' : isCyclic && scope === 'all' ? 'Usuń serię' : 'Usuń'}
        loading={isPending}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
        message={
          isCyclic ? (
            <div className="space-y-3">
              <p className="text-sm">
                Ten trening jest częścią <span className="font-bold text-white">cyklu</span>. Co chcesz usunąć?
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setScope('single')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === 'single'
                      ? 'bg-blue-500/15 border-blue-400/60 ring-1 ring-blue-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-1">📅 Tylko ten dzień</div>
                  <div className="text-[10px] text-white/60 leading-tight">Usuwa wybrany trening</div>
                </button>
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === 'all'
                      ? 'bg-purple-500/15 border-purple-400/60