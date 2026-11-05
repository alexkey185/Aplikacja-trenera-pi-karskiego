'use client';

import { useState } from 'react';
import { Check, X, Edit2, Trophy, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { zapiszWynikMeczu } from './actions';

export type MeczSezon = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  is_home: boolean | null;
  wynik_gospodarzy: number | null;
  wynik_gosci: number | null;
};

const formatDzien = (iso: string) => {
  const date = new Date(iso + 'T00:00:00');
  // Zwraca np. "Sob, 14 Lis"
  const formatted = date.toLocaleDateString('pl-PL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export function SezonClient({ mecze }: { mecze: MeczSezon[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [gospInput, setGospInput] = useState<string>('');
  const [goscInput, setGoscInput] = useState<string>('');
  const [isPending, setIsPending] = useState(false);

  // Grupowanie po miesiącach
  const grouped = mecze.reduce((acc, mecz) => {
    const dateObj = new Date(mecz.data + 'T00:00:00');
    const monthYear = dateObj.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(mecz);
    return acc;
  }, {} as Record<string, MeczSezon[]>);

  const startEdit = (mecz: MeczSezon) => {
    setEditingId(mecz.id);
    setGospInput(mecz.wynik_gospodarzy !== null ? String(mecz.wynik_gospodarzy) : '');
    setGoscInput(mecz.wynik_gosci !== null ? String(mecz.wynik_gosci) : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setGospInput('');
    setGoscInput('');
  };

  const handleSave = async (id: number) => {
    setIsPending(true);
    const gosp = gospInput === '' ? null : parseInt(gospInput, 10);
    const gosc = goscInput === '' ? null : parseInt(goscInput, 10);
    
    const res = await zapiszWynikMeczu(id, gosp, gosc);
    
    setIsPending(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Wynik zaktualizowany');
      setEditingId(null);
    }
  };

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-12 text-center shadow-xl shadow-black/40">
        <div className="w-16 h-16 rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white/50" strokeWidth={1.5} />
        </div>
        <h3 className="font-bold text-lg mb-2 text-white drop-shadow">Brak meczów w sezonie</h3>
        <p className="text-sm text-white/70">Dodaj mecz lub sparing w kalendarzu, aby pojawił się tutaj.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn pb-10">
      {Object.entries(grouped).map(([miesiac, lista]) => (
        <div key={miesiac}>
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 pl-1">
            {miesiac}
          </div>
          <div className="space-y-2">
            {lista.map((mecz) => {
              const isEditing = editingId === mecz.id;
              const isDom = mecz.is_home ?? true;
              
              // Kolorystyka przycisku z wynikiem
              let scoreBtnClass = 'bg-white/5 text-white/50 border-white/10 hover:border-white/20';
              if (mecz.wynik_gospodarzy !== null && mecz.wynik_gosci !== null) {
                if (mecz.wynik_gospodarzy > mecz.wynik_gosci) scoreBtnClass = 'bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25';
                else if (mecz.wynik_gospodarzy < mecz.wynik_gosci) scoreBtnClass = 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25';
                else scoreBtnClass = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/25';
              }

              return (
                <div 
                  key={mecz.id} 
                  className="flex items-center justify-between gap-3 p-3 md:p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all text-sm overflow-hidden"
                >
                  {/* LEWA STRONA: Info */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 font-medium">
                      <span>{formatDzien(mecz.data)}</span>
                      <span>•</span>
                      <span>{mecz.godzina}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {mecz.typ === 'mecz' ? <Trophy className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        <span className="capitalize">{mecz.typ}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 truncate">
                      <span className={`text-[11px] font-black w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ${isDom ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`} title={isDom ? 'Mecz u siebie' : 'Mecz na wyjeździe'}>
                        {isDom ? 'D' : 'W'}
                      </span>
                      <span className="font-semibold text-white truncate text-sm md:text-base">
                        {mecz.przeciwnik || 'Nieznany przeciwnik'}
                      </span>
                    </div>
                  </div>

                  {/* PRAWA STRONA: Wynik / Edycja */}
                  <div className="flex-shrink-0 flex items-center justify-end min-w-[100px]">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
                        <input
                          type="number"
                          value={gospInput}
                          onChange={(e) => setGospInput(e.target.value)}
                          className="w-8 h-8 md:w-9 md:h-9 bg-transparent text-center text-white font-bold outline-none focus:bg-white/5 rounded-lg"
                          placeholder="-"
                          autoFocus
                        />
                        <span className="text-white/30 font-bold">:</span>
                        <input
                          type="number"
                          value={goscInput}
                          onChange={(e) => setGoscInput(e.target.value)}
                          className="w-8 h-8 md:w-9 md:h-9 bg-transparent text-center text-white font-bold outline-none focus:bg-white/5 rounded-lg"
                          placeholder="-"
                        />
                        <div className="flex gap-1 ml-1 pl-2 border-l border-white/10">
                          <button
                            onClick={() => handleSave(mecz.id)}
                            disabled={isPending}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-500/20 hover:bg-green-500/40 text-green-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isPending}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(mecz)}
                        className={`group flex items-center justify-center gap-1.5 px-3 py-1.5 md:py-2 rounded-xl border font-bold text-sm md:text-base transition-all ${scoreBtnClass}`}
                        title="Kliknij, aby edytować wynik"
                      >
                        {mecz.wynik_gospodarzy !== null && mecz.wynik_gosci !== null ? (
                          <span>{mecz.wynik_gospodarzy} : {mecz.wynik_gosci}</span>
                        ) : (
                          <span className="opacity-70 text-xs">Wpisz wynik</span>
                        )}
                        <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}