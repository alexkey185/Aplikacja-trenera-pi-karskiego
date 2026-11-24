'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { PanelMiesiaca } from './PanelMiesiaca';
import { EventCard } from '@/components/EventCard';
import { getDzisISO } from '@/lib/dates';

// DODANO EXPORT
export type TreningZObecnoscia = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
  is_home?: boolean | null;
  wynik_gospodarzy?: number | null;
  wynik_gosci?: number | null;
  obecnosc: { trening_id: number; status: string }[] | null;
};

export function KalendarzClient({
  initialDni,
  poniedzialekISO,
  niedzielaISO,
  prevWeek,
  nextWeek,
  eventMap,
}: {
  initialDni: string[];
  poniedzialekISO: string;
  niedzielaISO: string;
  prevWeek: string;
  nextWeek: string;
  eventMap: Record<string, TreningZObecnoscia[]>;
}) {
  const dzisStr = getDzisISO();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (dzisStr >= poniedzialekISO && dzisStr <= niedzielaISO) return dzisStr;
    return poniedzialekISO;
  });

  const dni = initialDni.map((iso) => new Date(iso + 'T00:00:00'));
  const selectedEvents = eventMap[selectedDate] ?? [];
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');

  return (
    <div className="space-y-5">
      <div className="glass border border-white/10 rounded-2xl p-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">Miesiąc</button>
          </div>
          <Link href={`/kalendarz/nowy?data=${selectedDate}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dodaj</span>
          </Link>
        </div>
      </div>

      <PanelMiesiaca eventMap={eventMap} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="glass border border-white/10 rounded-3xl p-5 animate-fadeIn shadow-xl shadow-black/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            {selectedDate === dzisStr ? 'Dzisiaj' : 'Wybrany dzień'} · {selectedDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })}
          </h2>
        </div>

        {selectedEvents.length === 0 ? (
          <div className="text-center py-6 text-white/40 text-sm">
            Brak wydarzeń tego dnia
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((t) => (
              <EventCard key={t.id} trening={t} variant="full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}