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
} from 'lucide-react';

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

  const isCyclic = !!trening.cykl_id;

  // ══════════════════════════════════════════════
  // Submit — jeśli cykliczny → modal, jeśli nie → zapis od razu
  // ══════════════════════════════════════════════
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (isCyclic) {
      setFormData(fd);
      setPendingScope('single'); // domyślnie "tylko ten dzień"
      setShowScopeModal(true);
      return;
    }

    void submitWithScope('single', fd);
  };

  // ══════════════════════════════════════════════
  // Wykonaj zapis
  // ══════════════════════════════════════════════
  const submitWithScope = async (scope: 'single' | 'all', fd: FormData) => {
    setSaving(true);
    try {
      await aktualizujTrening(trening.id, scope, fd);
      // Sukces — zamknij modal, przekieruj
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
        {/* Banner dla cyklicznych */}
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
          <Field icon={CalendarIcon} label="Data" required>
            <input
              name="data"
              type="date"
              required
              defaultValue={trening.data}
              className="w-full bg-transparent border-0 outline-none text-white py-2 [color-scheme:dark]"
            />
          </Field>
          <Field icon={Clock} label="Godzina" required>
            <input
              name="godzina"
              type="time"
              required
              defaultValue={trening.godzina}
              className="w-full bg-transparent border-0 outline-none text-white py-2 [color-scheme:dark]"
            />
          </Field>
        </div>

        <Field icon={Trophy} label="Typ wydarzenia" required>
          <select
            name="typ"
            required
            defaultValue={trening.typ}
            className="w-full bg-transparent border-0 outline-none text-white py-2 [&>option]:bg-slate-800"
          >
            <option value="trening">🟦 Trening</option>
            <option value="mecz">🏆 Mecz</option>
            <option value="sparing">🔥 Sparing</option>
            <option value="turniej">🎯 Turniej</option>
          </select>
        </Field>

        <Field icon={MapPin} label="Miejsce">
          <input
            name="miejsce"
            defaultValue={trening.miejsce ?? ''}
            className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2"
          />
        </Field>

        <Field icon={Trophy} label="Przeciwnik">
          <input
            name="przeciwnik"
            defaultValue={trening.przeciwnik ?? ''}
            className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2"
          />
        </Field>

        <Field icon={FileText} label="Notatki">
          <textarea
            name="notatki"
            rows={3}
            defaultValue={trening.notatki ?? ''}
            className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 resize-none"
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0"
        >
          <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </form>

      {/* ═══════════════════════════════════════════ */}
      {/* MODAL: wybór zakresu zmian */}
      {/* ═══════════════════════════════════════════ */}
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

function Field({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: any;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block group">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-white/50 group-focus-within:text-green-400 transition-colors" />
        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
          {label}
          {required && <span className="text-green-400 ml-1">*</span>}
        </span>
      </div>
      <div className="bg-white/5 border border-white/15 focus-within:border-green-400/60 focus-within:bg-white/10 rounded-xl px-3 transition-all">
        {children}
      </div>
    </label>
  );
}