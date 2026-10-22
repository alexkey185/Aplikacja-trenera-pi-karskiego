'use client';

import { useState } from 'react';
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
  ExternalLink,
  Plus,
} from 'lucide-react';
import { getDzisISO, toISO } from '@/lib/dates';
import { DeleteEventButtonLazy } from '@/components/DeleteEventButtonLazy';

type TreningZObecnoscia = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
  obecnosc: { trening_id: number; status: string }[] | null;
};

type StatsMap = Map<number, { obecni: number; nieobecni: number }>;

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
                    ? 'bg-gradient-to-b from-green-500/20 to-green-700/5 border-2 border-green-400/50 shadow-lg shadow-green-500/20'
                    : czyWybrany
                    ? 'bg-gradient-to-b from-blue-500/25 to-blue-700/10 border-2 border-blue-400/60 ring-2 ring-blue-400/20 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/60 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="mb-3 pb-2 border-b border-white/10">
                  <div
                    className={`text-[10px] uppercase tracking-widest font-bold ${
                      czyDzis ? 'text-green-300' : czyWybrany ? 'text-blue-300' : 'text-white/40'
                    }`}
                  >
                    {formatDzienTyg(d)}
                  </div>
                  <div
                    className={`text-2xl font-black leading-none mt-1 ${
                      czyDzis ? 'text-green-400' : czyWybrany ? 'text-blue-300' : 'text-white'
                    }`}
                  >
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
                {czyWybrany && !czyDzis && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full shadow-lg shadow-blue-400/60" />
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
                    ? 'bg-gradient-to-b from-green-500/20 to-green-700/5 border-2 border-green-400/50 shadow-lg shadow-green-500/20'
                    : czyWybrany
                    ? 'bg-gradient-to-b from-blue-500/25 to-blue-700/10 border-2 border-blue-400/60 ring-2 ring-blue-400/20 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 border border-white/5 hover:border-white/20 hover:bg-slate-800'
                }`}
              >
                <div className="mb-2 flex-shrink-0">
                  <div
                    className={`text-[10px] uppercase tracking-widest font-bold ${
                      czyDzis ? 'text-green-300' : czyWybrany ? 'text-blue-300' : 'text-white/40'
                    }`}
                  >
                    {formatDzienTyg(d)}
                  </div>
                  <div
                    className={`text-2xl font-black leading-none mt-0.5 ${
                      czyDzis ? 'text-green-400' : czyWybrany ? 'text-blue-300' : 'text-white'
                    }`}
                  >
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
                {czyWybrany && !czyDzis && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full shadow-lg shadow-blue-400/60" />
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-white/40 text-sm mb-4">Brak wydarzeń tego dnia</div>
            <Link
              href={`/kalendarz/nowy?data=${selectedDate}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 hover:border-green-400/50 text-green-300 hover:text-green-200 font-semibold text-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Dodaj wydarzenie
            </Link>
          </div>
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
                    <div className="relative z-10 pointer-events-auto flex-shrink-0">
                      <DeleteEventButtonLazy id={t.id} cyklId={t.cykl_id} size="md" />
                    </div>
                    <Link href={`/kalendarz/${t.id}/obecnosc`} className="relative z-10 w-5 h-5 text-white/40 hover:text-green-400 transition-all flex-shrink-0">
                      <ChevronRightIcon className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* Adres treningu - klikalny link do Google Maps */}
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-400/30 text-white/70 hover:text-green-300 transition-all text-xs font-medium"
                      title="Otwórz w Google Maps"
                    >
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                      <span className="truncate flex-1">{t.miejsce}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
                    </a>
                  ) : (
                    <div className="relative z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-white/40 text-xs">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Brak adresu — dodaj w edycji wydarzenia</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Dodaj kolejne wydarzenie - zawsze widoczne, gdy są już wydarzenia */}
            <Link
              href={`/kalendarz/nowy?data=${selectedDate}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-white/60 hover:text-white text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Dodaj kolejne wydarzenie
            </Link>
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