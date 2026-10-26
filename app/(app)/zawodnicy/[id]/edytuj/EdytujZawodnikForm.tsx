'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { FormField } from '@/components/FormField';
import { Select } from '@/components/Select';
import { SubmitButton } from '@/components/SubmitButton';
import { DeleteButton } from './DeleteButton';
import { User, Hash, Trophy, Phone, FileText, Save, X, AlertCircle } from 'lucide-react';
import { aktualizujZawodnika } from './actions';
import type { FormState } from '@/lib/action-result';

type Zawodnik = {
  id: number;
  imie: string;
  nazwisko: string;
  rocznik: number | null;
  pozycja: string | null;
  numer: number | null;
  kontakt_rodzica: string | null;
  notatki: string | null;
};

export function EdytujZawodnikForm({ zawodnik }: { zawodnik: Zawodnik }) {
  const boundAction = aktualizujZawodnika.bind(null, zawodnik.id);
  const [state, formAction] = useActionState<FormState, FormData>(boundAction, null);

  const err = state?.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60"
    >
      {state?.error && (
        <div className="bg-red-500/15 border border-red-400/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField icon={User} label="Imię" required>
          <input
            name="imie"
            required
            defaultValue={zawodnik.imie}
            className={`w-full bg-transparent border-0 outline-none text-white py-2 ${err.imie ? 'text-red-400' : ''}`}
          />
          {err.imie && <p className="text-[10px] text-red-400 mt-1">{err.imie}</p>}
        </FormField>

        <FormField icon={User} label="Nazwisko" required>
          <input
            name="nazwisko"
            required
            defaultValue={zawodnik.nazwisko}
            className={`w-full bg-transparent border-0 outline-none text-white py-2 ${err.nazwisko ? 'text-red-400' : ''}`}
          />
          {err.nazwisko && <p className="text-[10px] text-red-400 mt-1">{err.nazwisko}</p>}
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField icon={Trophy} label="Rocznik">
          <input
            name="rocznik"
            type="number"
            defaultValue={zawodnik.rocznik ?? ''}
            className={`w-full bg-transparent border-0 outline-none text-white py-2 ${err.rocznik ? 'text-red-400' : ''}`}
          />
          {err.rocznik && <p className="text-[10px] text-red-400 mt-1">{err.rocznik}</p>}
        </FormField>

        <FormField icon={Hash} label="Numer">
          <input
            name="numer"
            type="number"
            defaultValue={zawodnik.numer ?? ''}
            className={`w-full bg-transparent border-0 outline-none text-white py-2 ${err.numer ? 'text-red-400' : ''}`}
          />
          {err.numer && <p className="text-[10px] text-red-400 mt-1">{err.numer}</p>}
        </FormField>
      </div>

      <FormField icon={Trophy} label="Pozycja">
        <Select
          name="pozycja"
          defaultValue={zawodnik.pozycja ?? ''}
          options={[
            { value: '', label: '- wybierz -' },
            { value: 'Bramkarz', label: '🧤 Bramkarz' },
            { value: 'Obrońca', label: '🛡️ Obrońca' },
            { value: 'Pomocnik', label: '⚽ Pomocnik' },
            { value: 'Napastnik', label: '⚡ Napastnik' },
          ]}
        />
      </FormField>

      <FormField icon={Phone} label="Kontakt do rodzica">
        <input
          name="kontakt_rodzica"
          type="tel"
          defaultValue={zawodnik.kontakt_rodzica ?? ''}
          className="w-full bg-transparent border-0 outline-none text-white py-2"
        />
      </FormField>

      <FormField icon={FileText} label="Notatki">
        <textarea
          name="notatki"
          rows={3}
          defaultValue={zawodnik.notatki ?? ''}
          className="w-full bg-transparent border-0 outline-none text-white py-2 resize-none"
        />
      </FormField>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Link
          href={`/zawodnicy/${zawodnik.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold py-3.5 rounded-2xl transition-all text-sm md:text-base"
        >
          <X className="w-4 h-4 flex-shrink-0" />
          Anuluj
        </Link>
        <div className="flex-1">
          <SubmitButton icon={Save} label="Zapisz zmiany" loadingLabel="Zapisywanie..." />
        </div>
        <DeleteButton id={zawodnik.id} />
      </div>
    </form>
  );
}