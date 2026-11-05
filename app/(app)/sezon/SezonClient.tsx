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
  return new Date(iso + 'T00:00:00').toLocaleDateString('pl-PL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).replace(',', '');
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
    <div className="space-y-8 animate-fadeIn">
      {Object.entries(grouped).map(([miesiac, lista]) => (
        <div key={miesiac}>
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 pl-2">
            {miesiac}
          </div>
          <div className="space-y-1.5">
            {lista.map((mecz) => {
              const isEditing = editingId === mecz.id;
              const isDom = mecz.is_home ?? true;
              
              let scoreClass = 'bg-white/5 text-white/40 border border-white/10';
              if (mecz.wynik_gospodarzy !== null && mecz.wynik_gosci !== null) {
                if (mecz.wynik_gospodarzy > mecz.wynik_gosci) scoreClass = 'bg-green-500/20 text-green-400 border border-green-500/30';
                else if (mecz.wynik_gospodarzy < mecz.wynik_gosci) scoreClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
                else scoreClass = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
              }

              return (
                <div key={mecz.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 transition-all text-sm">
                  
                  {/* Data i Godzina */}
                  <div className="flex items-center gap-3 w-[200px] shrink-0">
                    <span className="text-white/50 text-xs w-[110px]">{formatDzien(mecz.data)}</span>
                    <span className="font-bold text-white/90">{mecz.godzina}</span>
                  </div>

                  {/* Przeciwnik */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {mecz.przeciwnik?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="font-semibold text-white truncate">
                      {mecz.przeciwnik || 'Nieznany przeciwnik'}
                    </span>
                  </div>

                  {/* Dom / Wyjazd */}
                  <div className="w-8 text-center shrink-0">
                    <span className={`font-black text-xs ${isDom ? 'text-green-400' : 'text-orange-400'}`} title={isDom ? 'Mecz u siebie' : 'Mecz na wyjeździe'}>
                      {isDom ? 'D' : 'W'}
                    </span>
                  </div>

                  {/* WYNIK (klikalny) */}
                  <div className="w-[100px] flex justify-center shrink-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={gospInput}
                          onChange={(e) => setGospInput(e.target.value)}
                          className="w-8 h-8 bg-slate-950 border border-green-400/50 rounded text-center text-white font-bold outline-none focus:border-green-400"
                          placeholder="-"
                          autoFocus
                        />
                        <span className="text-white/30">:</span>
                        <input
                          type="number"
                          value={goscInput}
                          onChange={(e) => setGoscInput(e.target.value)}
                          className="w-8 h-8 bg-slate-950 border border-green-400/50 rounded text-center text-white font-bold outline-none focus:border-green-400"
                          placeholder="-"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(mecz)}
                        className={`group flex items-center justify-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs transition-all min-w-[60px] ${scoreClass}`}
                        title="Kliknij, aby edytować wynik"
                      >
                        {mecz.wynik_gospodarzy !== null && mecz.wynik_gosci !== null ? (
                          <span>{mecz.wynik_gospodarzy} : {mecz.wynik_gosci}</span>
                        ) : (
                          <span className="opacity-50 group-hover:opacity-100">- : -</span>
                        )}
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>

                  {/* Typ (Mecz/Sparing) */}
                  <div className="w-[100px] flex items-center justify-end gap-1.5 text-xs text-white/50 shrink-0">
                    {mecz.typ === 'mecz' ? <Trophy className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                    <span className="capitalize">{mecz.typ}</span>
                  </div>

                  {/* Przyciski akcji (tylko w trybie edycji) */}
                  <div className={`w-[60px] flex items-center justify-end gap-1 shrink-0 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                      onClick={() => handleSave(mecz.id)}
                      disabled={isPending}
                      className="w-7 h-7 rounded bg-green-500/20 hover:bg-green-500/40 text-green-400 flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Zapisz"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isPending}
                      className="w-7 h-7 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Anuluj"
                    >
                      <X className="w-4 h-4" />
                    </button>
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