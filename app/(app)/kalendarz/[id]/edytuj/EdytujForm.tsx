'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { aktualizujTrening } from './actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  Calendar as CalendarIcon, Clock, MapPin, Trophy, FileText, Save, Repeat, ExternalLink, X, Home, Plane,
} from 'lucide-react';
import { TimePicker } from '@/components/TimePicker';
import { DatePicker } from '@/components/DatePicker';
import { Select } from '@/components/Select';
import { FormField } from '@/components/FormField';

type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
  is_home: boolean | null;
};

export function EdytujForm({ trening }: { trening: Trening }) {
  const router = useRouter();
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [pendingScope, setPendingScope] = useState<'single' | 'all'>('single');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [miejsce, setMiejsce] = useState(trening.miejsce ?? '');
  const [typ, setTyp] = useState(trening.typ);
  const [isHome, setIsHome] = useState(trening.is_home ?? true);

  const isCyclic = !!trening.cykl_id;
  const isMecz = typ === 'mecz' || typ === 'sparing';

  const mapsUrl = miejsce.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(miejsce.trim())}`
    : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (isCyclic) {
      setFormData(fd);
      setPendingScope('single');
      setShowScopeModal(true);
      return;
    }
    void submitWithScope('single', fd);
  };

  const submitWithScope = async (scope: 'single' | 'all', fd: FormData) => {
    setSaving(true);
    try {
      const result = await aktualizujTrening(trening.id, scope, fd);
      setShowScopeModal(false);
      setFormData(null);
      if (result.scope === 'all') {
        toast.success('Cała seria zapisana');
      } else {
        toast.success('Trening zapisany');
      }
      router.push('/kalendarz');
      router.refresh();
    } catch (err) {
      console.error(err);
      setSaving(false);
      toast.error('Nie udało się zapisać', { description: err instanceof Error ? err.message : 'Nieznany błąd' });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60">
        <input type="hidden" name="is_home" value={isHome ? 'true' : 'false'} />
        
        {isCyclic && (
          <div className="bg-purple-500/10 border border-purple-400/30 rounded-2xl p-3 flex items-start gap-2 text-xs text-purple-200">
            <Repeat className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Ten trening jest częścią <span className="font-bold">cyklu</span>. Przy zapisie wybierzesz zakres zmian.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField icon={CalendarIcon} label="Data" required>
            <DatePicker name="data" defaultValue={trening.data} required />
          </FormField>
          <FormField icon={Clock} label="Godzina" required>
            <TimePicker name="godzina" defaultValue={trening.godzina} />
          </FormField>
        </div>

        <FormField icon={Trophy} label="Typ wydarzenia" required>
          <Select name="typ" value={typ} onChange={setTyp} options={[
            { value: 'trening', label: 'Trening' },
            { value: 'mecz', label: 'Mecz' },
            { value: 'sparing', label: 'Sparing' },
            { value: 'turniej', label: 'Turniej' },
          ]} />
        </FormField>

        {isMecz && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Miejsce rozgrywki</span>
            </div>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button type="button" onClick={() => setIsHome(true)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${isHome ? 'bg-green-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
                <Home className="w-4 h-4" /> U Siebie (Dom)
              </button>
              <button type="button" onClick={() => setIsHome(false)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${!isHome ? 'bg-orange-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
                <Plane className="w-4 h-4" /> Na Wyjeździe
              </button>
            </div>
          </div>
        )}

        <FormField icon={MapPin} label="Miejsce">
          <div className="flex items-center gap-1.5 w-full">
            <input name="miejsce" value={miejsce} onChange={(e) => setMiejsce(e.target.value)} placeholder="np. Boisko Orlik" autoComplete="new-password" spellCheck={false} className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 min-w-0" />
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-green-500/20 border border-white/10 flex items-center justify-center text-white/50 hover:text-green-400 transition-all flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </FormField>

        <FormField icon={Trophy} label="Przeciwnik">
          <input name="przeciwnik" defaultValue={trening.przeciwnik ?? ''} autoComplete="new-password" spellCheck={false} className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
        </FormField>

        <FormField icon={FileText} label="Notatki">
          <textarea name="notatki" rows={3} defaultValue={trening.notatki ?? ''} spellCheck={false} className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 resize-none" />
        </FormField>

        <div className="flex gap-2 pt-2">
          <Link href="/kalendarz" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold py-3.5 rounded-2xl transition-all text-sm md:text-base">
            <X className="w-4 h-4 flex-shrink-0" /> Anuluj
          </Link>
          <button type="submit" disabled={saving} className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all disabled:opacity-70 text-sm md:text-base">
            <Save className="w-4 h-4 flex-shrink-0" />
            <span>{saving ? 'Zapisywanie...' : 'Zapisz zmiany'}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showScopeModal}
        title="Zmienić całą serię?"
        variant="warning"
        confirmLabel={saving ? 'Zapisywanie...' : 'Zapisz'}
        cancelLabel="Anuluj"
        loading={saving}
        message={
          <div className="space-y-3">
            <p className="text-sm">Ten trening jest częścią cyklu. Co chcesz zmienić?</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button type="button" onClick={() => setPendingScope('single')} className={`p-3 rounded-xl border text-left transition-all ${pendingScope === 'single' ? 'bg-blue-500/15 border-blue-400/60' : 'bg-white/5 border-white/10'}`}>
                <div className="text-xs font-bold text-white mb-1">Tylko ten dzień</div>
              </button>
              <button type="button" onClick={() => setPendingScope('all')} className={`p-3 rounded-xl border text-left transition-all ${pendingScope === 'all' ? 'bg-purple-500/15 border-purple-400/60' : 'bg-white/5 border-white/10'}`}>
                <div className="text-xs font-bold text-white mb-1">Cała seria</div>
              </button>
            </div>
          </div>
        }
        onCancel={() => { setShowScopeModal(false); setFormData(null); }}
        onConfirm={() => { if (formData) void submitWithScope(pendingScope, formData); }}
      />
    </>
  );
}