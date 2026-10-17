'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Clock,
  MapPin,
  ChevronRight as ChevronRightIcon,
  BarChart3 as BarChart3Icon,
  Pencil,
} from 'lucide-react';
import { zapiszWynikLubNotatke } from './actions';
import { toast } from 'sonner';

type TreningZObecnoscia = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  obecnosc: { trening_id: number; status: string }[] | null;
};

type StatsMap = Map<number, { obecni: number; nieobecni: number }>;

function getDzisISO(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
}
function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function formatDzienTyg(date: Date) {
  return date.toLocaleDateString('pl-PL', { weekday: 'short' }).replace('.', '');
}

const typKolor = (typ: string) => {
  if (typ === 'mecz') return 'bg-red-500';
  if (typ === 'sparing') return 'bg-orange-500';
  if (typ === 'turniej') return 'bg-purple-500';
  return 'bg-blue-500';
};
const typBorder = (typ: string) => {
  if (typ === 'mecz') return 'border-l-red-500';
  if (typ === 'sparing') return 'border-l-orange-500';
  if (typ === 'turniej') return 'border-l-purple-500';
  return 'border-l-blue-500';
};
const typIkona = (typ: string) => {
  if (typ === 'mecz') return Trophy;
  return CalendarIcon;
};

export function DashboardClient({
  initialDni,
  poniedzialekISO,
  niedzielaISO,
  prevWeek,
  nextWeek,
  jestWTygodniu,
  eventMap,
  stats,
  wszystkieObecnosci,
}: {
  initialDni: Date[];
  poniedzialekISO: string;
  niedzielaISO: string;
  prevWeek: string;
  nextWeek: string;
  jestWTygodniu: boolean;
  eventMap: Record<string, TreningZObecnoscia[]>;
  stats: StatsMap;
  wszystkieObecnosci: { trening_id: number; status: string }[];
}) {
  const dzisStr = getDzisISO();
  const [selectedDate, setSelectedDate] = useState<string>(dzisStr);
  const [isPending, startTransition] = useTransition();

  const dni = initialDni;
  const selectedEvents = eventMap[selectedDate] ?? [];
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  
  const dniMobile = (() => {
    const startIdx = dni.findIndex((d) => toISO(d) === dzisStr);
    if (startIdx === -1) return dni.slice(0, 3);
    const start = dni.slice(startIdx, startIdx + 3);
    const brakuje = 3 - start.length;
    if (brakuje > 0) {
      const prev = dni.slice(0, startIdx).slice(-brakuje);
      return [...prev, ...start];
    }
    return start;
  })();

  const handleSaveNotatka = (id: number, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    startTransition(async () => {
      const res = await zapiszWynikLubNotatke(id, formData);
      if (res?.error) {
        toast.error('Błąd zapisu', { description: res.error });
      } else {
        toast.success('Zapisano');
      }
    });
  };

  return (
    <div>
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 mb-5 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/dashboard?w=${prevWeek}`}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="text-center px-2">
            <div className="font-bold text-white text-sm capitalize">
              {new Date(poniedzialekISO + 'T00:00:00').toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })} -{' '}
              {new Date(niedzielaISO + 'T00:00:00').toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })}
            </div>
            {jestWTygodniu && (
              <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">
                Bieżący tydzień
              </div>
            )}
          </div>
          <Link
            href={`/dashboard?w=${nextWeek}`}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:hidden grid grid-cols-3 gap-2">
          {dniMobile.map((d, i) => {
            const dataStr = toISO(d);
            const eventy = eventMap[dataStr] ?? [];
            const czyDzis = dataStr === dzisStr;
            const czyWybrany = dataStr === selectedDate;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dataStr)}
                className={`relative rounded-2xl p-3 transition-all min-h-[180px] flex flex-col text-left ${
                  czyDzis
                    ? 'bg-gradient-to-b from-green-500/20 to-green-700/5 border border-green-400/40 shadow-lg shadow-green-500/20'
                    : czyWybrany
                    ? 'bg-slate-800/80 border border-white/30 shadow-md'
                    : 'bg-slate-800/60 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="mb-3 pb-2 border-b border-white/10">
                  <div className={`text-[10px] uppercase tracking-widest font-bold ${czyDzis ? 'text-green-300' : czyWybrany ? 'text-white' : 'text-white/40'}`}>
                    {formatDzienTyg(d)}
                  </div>
                  <div className={`text-2xl font-black leading-none mt-1 ${czyDzis ? 'text-green-400' : 'text-white'}`}>
                    {d.getDate()}
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {eventy.length === 0 && <div className="text-[10px] text-white/30 py-2">brak</div>}
                  {eventy.map((t) => (
                    <div key={t.id} className={`text-[10px] rounded-md border-l-2 px-2 py-1.5 text-white ${typBorder(t.typ)} bg-white/5`}>
                      <div className="font-bold leading-tight">{t.godzina}</div>
                      <div className="text-white/70 leading-tight capitalize truncate">{t.typ}</div>
                    </div>
                  ))}
                </div>
                {czyDzis && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400 rounded-full shadow-lg shadow-green-400/60" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:grid grid-cols-7 gap-2">
          {dni.map((d, i) => {
            const dataStr = toISO(d);
            const eventy = eventMap[dataStr] ?? [];
            const czyDzis = dataStr === dzisStr;
            const czyWybrany = dataStr === selectedDate;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dataStr)}
                className={`group relative rounded-2xl p-3 transition-all hover:-translate-y-0.5 min-h-[180px] flex flex-col text-left ${
                  czyDzis
                    ? 'bg-gradient-to-b from-green-500/20 to-green-700/5 border border-green-400/40 shadow-lg shadow-green-500/20'
                    : czyWybrany
                    ? 'bg-slate-800/80 border border-white/30 shadow-md'
                    : 'bg-slate-800/50 border border-white/5 hover:border-white/20 hover:bg-slate-800'
                }`}
              >
                <div className="mb-2 flex-shrink-0">
                  <div className={`text-[10px] uppercase tracking-widest font-bold ${czyDzis ? 'text-green-300' : czyWybrany ? 'text-white' : 'text-white/40'}`}>
                    {formatDzienTyg(d)}
                  </div>
                  <div className={`text-2xl font-black leading-none mt-0.5 ${czyDzis ? 'text-green-400' : 'text-white'}`}>
                    {d.getDate()}
                  </div>
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  {eventy.slice(0, 3).map((t) => (
                    <div key={t.id} className={`text-[10px] rounded-md border-l-2 px-1.5 py-1 text-white truncate ${typBorder(t.typ)} bg-white/5`}>
                      <div className="font-bold leading-tight">{t.godzina}</div>
                      <div className="truncate text-white/70 leading-tight capitalize">{t.typ}</div>
                    </div>
                  ))}
                </div>
                {eventy.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-shrink-0">
                    {eventy.slice(0, 4).map((e, idx) => (
                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${typKolor(e.typ)}`} />
                    ))}
                  </div>
                )}
                {czyDzis && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400 rounded-full shadow-lg shadow-green-400/60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-5 animate-fadeIn shadow-xl shadow-black/40">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-1.5 h-1.5 rounded-full ${selectedDate === dzisStr ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">
            {selectedDate === dzisStr ? 'Dzisiaj' : 'Wybrany dzień'} · {selectedDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })}
          </h2>
        </div>
        
        {selectedEvents.length === 0 ? (
          <div className="text-center py-6 text-white/40 text-sm">Brak wydarzeń tego dnia</div>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((t) => {
              const Icon = typIkona(t.typ);
              const s = stats.get(t.id);
              const mapsUrl = t.miejsce?.trim()
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.miejsce.trim())}`
                : null;
              return (
                <div key={t.id} className={`group relative flex flex-col p-3 rounded-2xl border-l-4 ${typBorder(t.typ)} bg-white/5 hover:bg-white/10 transition-all gap-3`}>
                  <div className="flex items-center gap-2">
                    <Link href={`/kalendarz/${t.id}/obecnosc`} className="absolute inset-0 z-0 rounded-2xl" />
                    <div className="relative z-10 pointer-events-none flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-lg font-bold text-white leading-none">{t.godzina}</div>
                      </div>
                      <div className="w-px h-10 bg-white/10 flex-shrink-0 hidden sm:block" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate capitalize">
                          {t.typ}
                          {t.przeciwnik && <span className="text-white/60 font-normal"> vs {t.przeciwnik}</span>}
                        </div>
                        {t.miejsce ? (
                          mapsUrl ? (
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="pointer-events-auto text-xs text-white/50 hover:text-green-400 flex items-center gap-1 mt-0.5 w-fit max-w-full">
                              <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{t.miejsce}</span>
                            </a>
                          ) : (
                            <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /><span>{t.miejsce}</span></div>
                          )
                        ) : null}
                        {s && (s.obecni > 0 || s.nieobecni > 0) && (
                          <div className="text-xs mt-1 flex items-center gap-3">
                            <span className="text-green-400 font-medium">✓ {s.obecni}</span>
                            {s.nieobecni > 0 && <span className="text-red-400 font-medium">✗ {s.nieobecni}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/kalendarz/${t.id}/edytuj`} className="hidden md:flex relative z-10 pointer-events-auto w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 items-center justify-center text-white/50 hover:text-white transition-all flex-shrink-0">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <Link href={`/kalendarz/${t.id}/obecnosc`} className="relative z-10 w-5 h-5 text-white/40 hover:text-green-400 transition-all flex-shrink-0">
                      <ChevronRightIcon className="w-5 h-5" />
                    </Link>
                  </div>

                  <form onSubmit={(e) => handleSaveNotatka(t.id, e)} className="relative z-10 mt-1 flex gap-2 items-center pointer-events-auto">
                    <input
                      name="notatki"
                      defaultValue={t.notatki ?? ''}
                      placeholder="Wpisz wynik lub notatkę (np. 3:2)..."
                      className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-green-400/50 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/40 text-green-300 text-xs font-semibold border border-green-400/30 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      Zapisz
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
        <div className="hidden md:block bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Nadchodzące</h2>
          </div>
          {(() => {
            const wszystkie = Object.values(eventMap).flat().filter((t) => t.data > dzisStr).sort((a, b) => a.data.localeCompare(b.data) || a.godzina.localeCompare(b.godzina)).slice(0, 3);
            if (wszystkie.length === 0) return <div className="text-center py-6 text-white/40 text-sm">Brak</div>;
            return (
              <div className="space-y-2">
                {wszystkie.map((t) => (
                  <Link key={t.id} href={`/kalendarz/${t.id}/obecnosc`} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${typBorder(t.typ)} bg-white/5 hover:bg-white/10 transition-all`}>
                    <div className="flex-shrink-0 text-center w-10">
                      <div className="text-[10px] text-white/40 uppercase font-bold">{new Date(t.data + 'T00:00:00').toLocaleDateString('pl-PL', { month: 'short' })}</div>
                      <div className="text-lg font-black text-white">{new Date(t.data + 'T00:00:00').getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate capitalize">{t.godzina} · {t.typ}{t.przeciwnik && ` vs ${t.przeciwnik}`}</div>
                      {t.miejsce && <div className="text-[10px] text-white/50 truncate mt-0.5">{t.miejsce}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3Icon className="w-3.5 h-3.5 text-green-400" />
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Frekwencja - {new Date().toLocaleDateString('pl-PL', { month: 'long' })}</h2>
          </div>
          {(() => {
            const rokMiesiac = dzisStr.substring(0, 7);
            const treningiMies = Object.values(eventMap).flat().filter((t) => t.data.startsWith(rokMiesiac));
            const idsMies = new Set(treningiMies.map((t) => t.id));
            const obecnosciMies = wszystkieObecnosci.filter((o) => idsMies.has(o.trening_id));
            const obecniMies = obecnosciMies.filter((o) => o.status === 'obecny' || o.status === 'spozniony').length;
            const procent = obecnosciMies.length > 0 ? Math.round((obecniMies / obecnosciMies.length) * 100) : 0;
            return (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black text-white leading-none">{procent}</span>
                  <span className="text-2xl text-white/40 font-bold">%</span>
                </div>
                <div className="w-full h-3 bg-slate-950/60 rounded-full overflow-hidden mb-3 shadow-inner">
                  <div className={`h-full rounded-full transition-all ${procent >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' : procent >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`} style={{ width: `${procent}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                  <span><span className="text-green-400 font-semibold">{obecniMies}</span> obecnych</span>
                  <span>{obecnosciMies.length} wpisów</span>
                </div>
                <Link href="/statystyki" className="w-full flex items-center justify-center gap-2 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 transition-all">
                  <BarChart3Icon className="w-3.5 h-3.5" /> Pełne statystyki
                </Link>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}