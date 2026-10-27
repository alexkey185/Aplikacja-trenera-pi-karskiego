'use client';

import { useActionState } from 'react';
import { Save, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { zaktualizujProfil, type ProfilFormState } from './actions';

export function ProfilForm({ imie, nazwisko }: { imie: string; nazwisko: string }) {
  const [state, formAction] = useActionState<ProfilFormState, FormData>(
    zaktualizujProfil,
    null
  );

  return (
    <form
      action={formAction}
      className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4 animate-fadeIn shadow-2xl shadow-black/60"
    >
      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-green-400" />
        <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
          Dane osobowe
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <label className="block group">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Imię
          </div>
          <input
            name="imie"
            type="text"
            defaultValue={imie}
            placeholder="np. Adam"
            className="w-full bg-white/5 border border-white/15 focus:border-green-400/60 focus:bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none transition-all"
          />
        </label>
        <label className="block group">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Nazwisko
          </div>
          <input
            name="nazwisko"
            type="text"
            defaultValue={nazwisko}
            placeholder="np. Pilny"
            className="w-full bg-white/5 border border-white/15 focus:border-green-400/60 focus:bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none transition-all"
          />
        </label>
      </div>

      {state?.error && (
        <div className="mb-4 bg-red-500/15 border border-red-400/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="mb-4 bg-green-500/15 border border-green-400/40 rounded-xl p-3 flex items-start gap-2 text-xs text-green-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Zapisano pomyślnie.</span>
        </div>
      )}

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5"
      >
        <Save className="w-4 h-4" />
        Zapisz dane
      </button>
    </form>
  );
}