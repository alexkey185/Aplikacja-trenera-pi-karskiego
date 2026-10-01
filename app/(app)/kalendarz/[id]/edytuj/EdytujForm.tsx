'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { aktualizujTrening } from './actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  FileText,
  Save,
  Repeat,
  ExternalLink,
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
};

export function EdytujForm({ trening }: { trening: Trening }) {
  const router = useRouter();
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [pendingScope, setPendingScope] = useState<'single' | 'all'>('single');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [miejsce, setMiejsce] = useState(trening.miejsce ?? '');

  const isCyclic = !!trening.cykl_id;

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
      await aktualizujTrening(trening.id, scope, fd);
      setShowScopeModal(false);
      setFormData(null);
      router.push('/kalendarz');
      router.refresh();
    } catch (err) {
      console.error(err);
      setSaving(false);
      alert('Błąd zapisu: ' + (err instanceof Error ? err.message : 'nieznany'));
    }
  };

  const handleModalConfirm = () => {
    if (!formData) return;
    void submitWithScope(pendingScope, formData);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60"
      >
        {isCyclic && (
          <div className="bg-purple-500/10 border border-purple-400/30 rounded-2xl p-3 flex items-start gap-2 text-xs text-purple-200">
            <Repeat className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Ten trening jest częścią <span className="font-bold">cyklu</span>. Przy
              zapisie wybierzesz, czy zmiany mają dotyczyć tylko tego dnia, czy całej serii.
            </span>
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
          <Select
            name="typ"
            defaultValue={trening.typ}
            options={[
              { value: 'trening', label: '🟦 Trening' },
              { value: 'mecz', label: '🏆 Mecz' },
              { value: 'sparing', label: '🔥 Sparing' },
              { value: 'turniej', label: '🎯 Turniej' },
            ]}
          />
        </FormField>

        <FormField icon={MapPin} label="Miejsce">
          <div className="flex items-center gap-1.5 w-full">
            <input
              name="miejsce"
              value={miejsce}
              onChange={(e) => setMiejsce(e.target.value)}
              placeholder="np. Boisko Orlik"
              className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 min-w-0"
            />
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Otwórz w Google Maps"
                aria-label="Otwórz lokalizację w Google Maps"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-400/40 flex items-center justify-center text-white/50 hover:text-green-400 transition-all flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </FormField>

        <FormField icon={Trophy} label="Przeciwnik">
          <input
            name="przeciwnik"
            defaultValue={trening.przeciwnik ?? ''}
            className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2"
          />
        </FormField>

        <FormField icon={FileText} label="Notatki">
          <textarea
            name="notatki"
            rows={3}
            defaultValue={trening.notatki ?? ''}
            className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 resize-none"
          />
        </FormField>

        <button
          type="submit"
          disabled={saving}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0"
        >
          <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
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
            <p className="text-sm">
              Ten trening jest częścią cyklu. Co chcesz zmienić?
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => setPendingScope('single')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  pendingScope === 'single'
                    ? 'bg-blue-500/15 border-blue-400/60 ring-1 ring-blue-400/30'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-xs font-bold text-white mb-1">
                  📅 Tylko ten dzień
                </div>
                <div className="text-[10px] text-white/60 leading-tight">
                  Zmieniasz {trening.data}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPendingScope('all')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  pendingScope === 'all'
                    ? 'bg-purple-500/15 border-purple-400/60 ring-1 ring-purple-400/30'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-xs font-bold text-white mb-1">
                  🔁 Cała seria
                </div>
                <div className="text-[10px] text-white/60 leading-tight">
                  Wszystkie z tego cyklu
                </div>
              </button>
            </div>

            {pendingScope === 'all' && (
              <div className="text-[10px] text-purple-200 bg-purple-500/10 border border-purple-400/30 rounded-lg p-2">
                ℹ️ Daty poszczególnych treningów <strong>nie zmienią się</strong> — tylko godzina, miejsce i notatki.
              </div>
            )}
          </div>
        }
        onCancel={() => {
          setShowScopeModal(false);
          setFormData(null);
        }}
        onConfirm={handleModalConfirm}
      />
    </>
  );
}