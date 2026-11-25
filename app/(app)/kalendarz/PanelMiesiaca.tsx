'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TreningZFrekwencja } from './KalendarzClient';

export function PanelMiesiaca({
  eventMap,
  selectedDate,
  onSelectDate,
}: {
  eventMap: Record<string, TreningZFrekwencja[]>;
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
    
    const dniArray: (Date | null)[] = [];
    for (let i = 0; i < dzienTygodnia; i++) dniArray.push(null);
    for (let i = 1; i <= ostatniDzien.getDate(); i++) dniArray.push(new Date(rok, miesiac, i));
    return dniArray;
  }, [viewDate]);

  const dniTygodnia = ['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND'];

  const typKolor = (typ: string) => {
    if (typ === 'mecz') return 'bg-red-500';
    if (typ === 'sparing') return 'bg-orange-500';
    if (typ === 'turniej') return 'bg-purple-500';
    return 'bg-blue-500';
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dniTygodnia.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
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
              className={`aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center p-1 transition-all relative border ${
                czyWybrany
                  ? 'bg-transparent border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] text-green-400'
                  : czyDzis
                  ? 'bg-white/5 border-green-500/30 text-green-300'
                  : 'bg-transparent border-transparent hover:bg-white/5 text-white/80'
              }`}
            >
              <span className={`text-sm md:text-base font-bold ${czyWybrany ? 'text-green-400' : ''}`}>
                {d.getDate()}
              </span>
              
              {czyDzis && <div className="text-[8px] font-bold text-green-400 uppercase mt-0.5 leading-none">Dziś</div>}
              
              {eventy.length > 0 && (
                <div className="absolute bottom-2 flex gap-1">
                  {eventy.slice(0, 3).map((e, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${typKolor(e.typ)}`} />
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