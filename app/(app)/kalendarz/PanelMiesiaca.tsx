'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// Ten import zadziała, bo dodaliśmy "export" w KalendarzClient.tsx
import type { TreningZObecnoscia } from './KalendarzClient';

export function PanelMiesiaca({
  eventMap,
  selectedDate,
  onSelectDate,
}: {
  eventMap: Record<string, TreningZObecnoscia[]>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const dzisStr = new Date().toLocaleDateString('sv-SE');
  
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const dni = useMemo(() => {
    const rok = viewDate.getFullYear();
    const miesiac = viewDate.getMonth();
    const pierwszyDzien = new Date(rok, miesiac, 1);
    const ostatniDzien = new Date(rok, miesiac + 1, 0);
    const dzienTygodnia = (pierwszyDzien.getDay() + 6) % 7; 
    
    const dniArray = [];
    for (let i = 0; i < dzienTygodnia; i++) {
      dniArray.push(null);
    }
    for (let i = 1; i <= ostatniDzien.getDate(); i++) {
      dniArray.push(new Date(rok, miesiac, i));
    }
    return dniArray;
  }, [viewDate]);

  const dniTygodnia = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

  return (
    <div className="glass border border-white/10 rounded-3xl p-4 animate-fadeIn shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="font-bold text-white text-sm capitalize">
          {viewDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dniTygodnia.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-white/40 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dni.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="aspect-square" />;
          
          const dataStr = d.toLocaleDateString('sv-SE');
          const eventy = eventMap[dataStr] ?? [];
          const czyDzis = dataStr === dzisStr;
          const czyWybrany = dataStr === selectedDate;
          
          return (
            <button
              key={dataStr}
              onClick={() => onSelectDate(dataStr)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all relative ${
                czyDzis
                  ? 'bg-green-500/20 border border-green-400/50 text-green-300'
                  : czyWybrany
                  ? 'bg-blue-500/20 border border-blue-400/50 text-blue-300'
                  : 'bg-white/5 border border-transparent hover:bg-white/10 text-white'
              }`}
            >
              <span className={`text-sm font-semibold ${czyDzis ? 'text-green-400' : czyWybrany ? 'text-blue-300' : ''}`}>
                {d.getDate()}
              </span>
              {eventy.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {eventy.slice(0, 3).map((e, idx) => (
                    <div key={idx} className={`w-1 h-1 rounded-full ${
                      e.typ === 'mecz' ? 'bg-red-400' : e.typ === 'sparing' ? 'bg-orange-400' : 'bg-blue-400'
                    }`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}