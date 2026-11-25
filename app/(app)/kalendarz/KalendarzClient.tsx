'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, Calendar as CalendarIcon, Trophy, Flame, Target, Download } from 'lucide-react';
import { PanelMiesiaca } from './PanelMiesiaca';
import { getDzisISO } from '@/lib/dates';

export type TreningZFrekwencja = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
  is_home: boolean | null;
  wynik_gospodarzy: number | null;
  wynik_gosci: number | null;
  obecni: number;
  nieobecni: number;
};

export function KalendarzClient({ initialTreningi }: { initialTreningi: TreningZFrekwencja[] }) {
  const dzisStr = getDzisISO();
  const [selectedDate, setSelectedDate] = useState<string>(dzisStr);

  // Grupowanie treningów
  const eventMap = initialTreningi.reduce((acc, t) => {
    if (!acc[t.data]) acc[t.data] = [];
    acc[t.data].push(t);
    return acc;
  }, {} as Record<string, TreningZFrekwencja[]>);

  const selectedEvents = eventMap[selectedDate] ?? [];
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');

  // Statystyki dla górnych kart
  const stats = {
    treningi: initialTreningi.filter(t => t.typ === 'trening').length,
    mecze: initialTreningi.filter(t => t.typ === 'mecz').length,
    sparingi: initialTreningi.filter(t => t.typ === 'sparing').length,
    turnieje: initialTreningi.filter(t => t.typ === 'turniej').length,
  };

  // Najbliższe wydarzenia (od dzisiaj w górę)
  const nadchodzace = initialTreningi
    .filter(t => t.data >= dzisStr)
    .sort((a, b) => a.data.localeCompare(b.data) || a.godzina.localeCompare(b.godzina))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fadeIn">
      
      {/* LEWA KOLUMNA (Główna) */}
      <div className="xl:col-span-2 space-y-4">
        
        {/* Pasek "Brak wydarzeń dzisiaj" / "Dzisiaj" */}
        <div className={`rounded-3xl p-4 md:p-5 flex items-center justify-between border ${selectedEvents.length === 0 ? 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20' : 'bg-slate-900/80 border-white/10 backdrop-blur-md'}`}>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                 <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                 <div className="text-[10px] md:text-xs font-bold text-green-400 uppercase tracking-widest mb-0.5">Dzisiaj · {new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })}</div>
                 <div className="font-bold text-white text-sm md:text-base">
                    {selectedEvents.length === 0 ? 'Brak wydarzeń' : `${selectedEvents.length} wydarzeń`}
                 </div>
                 <div className="text-xs text-white/50">
                    {selectedEvents.length === 0 ? 'Nic nie zaplanowano na dziś' : 'Sprawdź harmonogram na dziś'}
                 </div>
              </div>
           </div>
        </div>

        {/* Górne statystyki (4 kafelki) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="TRENINGI" value={stats.treningi} color="blue" icon={CalendarIcon} />
          <StatCard label="MECZE" value={stats.mecze} color="red" icon={Trophy} />
          <StatCard label="SPARINGI" value={stats.sparingi} color="orange" icon={Flame} />
          <StatCard label="TURNIEJE" value={stats.turnieje} color="purple" icon={Target} />
        </div>

        {/* Siatka Kalendarza */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 md:p-6 shadow-xl relative">
           <div className="flex items-center justify-between mb-6">
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50"><ChevronRight className="w-4 h-4 rotate-180" /></button>
              <div className="text-center">
                 <div className="text-lg font-bold text-white capitalize">{selectedDateObj.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</div>
                 <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Bieżący miesiąc</div>
              </div>
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50"><ChevronRight className="w-4 h-4" /></button>
           </div>
           
           <PanelMiesiaca 
              eventMap={eventMap} 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
           />

           {/* Legenda */}
           <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/10 text-xs text-white/60">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Trening</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Mecz</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> Sparing</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> Turniej</div>
           </div>
        </div>
      </div>

      {/* PRAWA KOLUMNA (Panel Boczny) */}
      <div className="space-y-4">
         {/* Panel "Wybrany Dzień" */}
         <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl">
            <div className="flex items-start justify-between mb-6">
               <div>
                  <div className="flex items-baseline gap-2 mb-1">
                     <span className="text-3xl font-black text-white">{selectedDateObj.getDate()}</span>
                     <span className="text-sm font-semibold text-white/70 capitalize">{selectedDateObj.toLocaleDateString('pl-PL', { weekday: 'long' })}</span>
                  </div>
                  <div className="text-xs text-white/50">{selectedDateObj.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</div>
               </div>
               {selectedDate === dzisStr && (
                  <span className="px-2 py-1 rounded-md bg-green-500/15 border border-green-400/30 text-[10px] font-bold text-green-400 uppercase">Dzisiaj</span>
               )}
            </div>

            <div className="flex flex-col items-center justify-center py-6 text-center">
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  <CalendarIcon className="w-6 h-6 text-white/30" />
               </div>
               <div className="font-semibold text-white/80 mb-1">Brak wydarzeń</div>
               <div className="text-xs text-white/50 mb-4">Nic nie zaplanowano na ten dzień.</div>
               <Link href={`/kalendarz/nowy?data=${selectedDate}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white text-xs font-bold transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Dodaj wydarzenie
               </Link>
            </div>
         </div>

         {/* Panel "Najbliższe wydarzenia" */}
         <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl">
            <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-red-400" /> Najbliższe wydarzenia
            </h3>
            <div className="space-y-2">
               {nadchodzace.length === 0 ? (
                  <div className="text-center text-xs text-white/40 py-4">Brak nadchodzących wydarzeń</div>
               ) : (
                  nadchodzace.map(t => {
                     const d = new Date(t.data + 'T00:00:00');
                     return (
                        <Link key={t.id} href={`/kalendarz/${t.id}/obecnosc`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center text-blue-400">
                              <span className="text-[10px] font-bold leading-none">{d.getDate()}.{String(d.getMonth()+1).padStart(2,'0')}</span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white truncate">{t.godzina} · {t.typ}</div>
                              <div className="text-[10px] text-white/50 truncate capitalize">{t.typ}</div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                        </Link>
                     )
                  })
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

// Mały komponent pomocniczy do kafelków statystyk
function StatCard({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: any }) {
  const colorMap: any = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-3 md:p-4 flex items-center gap-3`}>
       <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
         <Icon className="w-4 h-4" />
       </div>
       <div>
         <div className="text-xl font-black text-white leading-none mb-1">{value}</div>
         <div className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{label}</div>
       </div>
    </div>
  );
}