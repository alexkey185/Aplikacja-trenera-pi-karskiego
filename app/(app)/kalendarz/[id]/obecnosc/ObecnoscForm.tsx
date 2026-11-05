'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { zapiszObecnosc } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Save, TrendingUp } from 'lucide-react';
import { ZawodnikRow, type Zawodnik, type StatusValue } from './ZawodnikRow';

export function ObecnoscForm({
  treningId, zawodnicy, initialStatus, previousStatus = {}
}: {
  treningId: number;
  zawodnicy: Zawodnik[];
  initialStatus: Record<number, string>;
  previousStatus?: Record<number, string>;
}) {
  const [statuses, setStatuses] = useState<Record<number, StatusValue>>(() => {
    // Draft offline
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem(`draft_obecnosc_${treningId}`);
      if (draft) {
        try { return JSON.parse(draft); } catch {}
      }
    }
    
    const init: Record<number, StatusValue> = {};
    zawodnicy.forEach((z) => {
      const obecny = initialStatus[z.id];
      if (obecny === 'obecny' || obecny === 'spozniony') { init[z.id] = 'obecny'; return; }
      if (obecny === 'nieobecny' || obecny === 'usprawiedliwiony') { init[z.id] = 'nieobecny'; return; }
      const poprzedni = previousStatus[z.id];
      if (poprzedni === 'nieobecny' || poprzedni === 'usprawiedliwiony') { init[z.id] = 'nieobecny'; return; }
      init[z.id] = 'obecny';
    });
    return init;
  });

  useEffect(() => {
    localStorage.setItem(`draft_obecnosc_${treningId}`, JSON.stringify(statuses));
  }, [statuses, treningId]);

  const stats = useMemo(() => {
    const s = { obecny: 0, nieobecny: 0 };
    Object.values(statuses).forEach((v) => { if (v === 'obecny') s.obecny += 1; else if (v === 'nieobecny') s.nieobecny += 1; });
    return s;
  }, [statuses]);

  // useCallback zapobiega tworzeniu nowej referencji funkcji przy każdym renderze
  // (dzięki temu React.memo w ZawodnikRow działa poprawnie)
  const handleStatusChange = useCallback((id: number, status: StatusValue) => {
    setStatuses((s) => ({ ...s, [id]: status }));
  }, []);

  const total = zawodnicy.length;
  const procent = total > 0 ? Math.round((stats.obecny / total) * 100) : 0;

  return (
    <form 
      action={async (formData) => {
        localStorage.removeItem(`draft_obecnosc_${treningId}`);
        await zapiszObecnosc(treningId, formData);
      }} 
      className="space-y-3 pb-24"
    >
      {/* Pasek statystyk (sticky top, zostawiamy blur bo jest tylko 1) */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-2xl p-3 animate-fadeIn sticky top-4 z-10 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-xl blur-md opacity-60" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white drop-shadow leading-none">{stats.obecny}</span>
              <span className="text-white/60 text-sm">/ {total}</span>
              <span className="text-white/80 text-xs ml-auto font-semibold">{procent}%</span>
            </div>
            <div className="text-[10px] text-white/60 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>obecnych</span>
              {stats.nieobecny > 0 && <><span className="text-white/30">·</span><span className="text-red-400/80 font-medium">{stats.nieobecny} nieob.</span></>}
            </div>
          </div>
        </div>
        <div className="mt-2 h-1.5 bg-slate-900/70 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${procent >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' : procent >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`} style={{ width: `${procent}%` }} />
        </div>
      </div>

      {/* Lista zawodników (bez backdrop-blur na mobile, dla wydajności) */}
      <ul className="space-y-1 md:space-y-1.5">
        {zawodnicy.map((z, i) => (
          <ZawodnikRow
            key={z.id}
            zawodnik={z}
            status={statuses[z.id]}
            onChange={handleStatusChange}
            index={i}
          />
        ))}
      </ul>

      {Object.entries(statuses).map(([zawodnikId, status]) => (
        <input key={zawodnikId} type="hidden" name={`status_${zawodnikId}`} value={status} />
      ))}

      {/* Sticky Bar nad dolnym menu */}
      <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-white/10 p-3 md:static md:bg-transparent md:border-0 md:p-0 md:pt-4">
        <div className="max-w-2xl mx-auto">
          <SubmitButton icon={Save} label="Zapisz obecność" loadingLabel="Zapisywanie..." />
        </div>
      </div>
    </form>
  );
}