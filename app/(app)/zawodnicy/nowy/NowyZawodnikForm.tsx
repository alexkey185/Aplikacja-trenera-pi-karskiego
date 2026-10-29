'use client';

import { useActionState } from 'react';
import { FormField } from '@/components/FormField';
import { Select } from '@/components/Select';
import { SubmitButton } from '@/components/SubmitButton';
import { User, Trophy, Hash, Phone, FileText, AlertCircle } from 'lucide-react';
import { dodajZawodnika } from './actions';
import type { FormState } from '@/lib/action-result';

export function NowyZawodnikForm() {
  const [state, formAction] = useActionState<FormState, FormData>(dodajZawodnika, null);

  const err = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60">
      
      {state?.error && (
        <div className="bg-red-500/15 border border-red-400/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField icon={User} label="ImiÄ™" required>
          <input 
            name="imie" 
            placeholder="np. Kamil" 
            className={`w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 ${err.imie ? 'text-red-400' : ''}`} 
          />
          {err.imie && <p className="text-[10px] text-red-400 mt-1">{err.imie}</p>}
        </FormField>

        <FormField icon={User} label="Nazwisko" required>
          <input 
            name="nazwisko" 
            placeholder="np. Nowak" 
            className={`w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 ${err.nazwisko ? 'text-red-400' : ''}`} 
          />
          {err.nazwisko && <p className="text-[10px] text-red-400 mt-1">{err.nazwisko}</p>}
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField icon={Trophy} label="Rocznik">
          <input 
            name="rocznik" 
            type="number" 
            placeholder="2012" 
            className={`w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 ${err.rocznik ? 'text-red-400' : ''}`} 
          />
          {err.rocznik && <p className="text-[10px] text-red-400 mt-1">{err.rocznik}</p>}
        </FormField>

        <FormField icon={Hash} label="Numer">
          <input 
            name="numer" 
            type="number" 
            placeholder="7" 
            className={`w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 ${err.numer ? 'text-red-400' : ''}`} 
          />
          {err.numer && <p className="text-[10px] text-red-400 mt-1">{err.numer}</p>}
        </FormField>
      </div>

      <FormField icon={Trophy} label="Pozycja">
        <Select
          name="pozycja"
          defaultValue=""
          options={[
            { value: '', label: '- wybierz -' },
            { value: 'Bramkarz', label: 'đź§¤ Bramkarz' },
            { value: 'ObroĹ„ca', label: 'đź›ˇď¸Ź ObroĹ„ca' },
            { value: 'Pomocnik', label: 'âš˝ Pomocnik' },
            { value: 'Napastnik', label: 'âšˇ Napastnik' },
          ]}
        />
      </FormField>

      <FormField icon={Phone} label="Kontakt do rodzica">
        <input name="kontakt_rodzica" type="tel" placeholder="600 100 200" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
      </FormField>

      <FormField icon={FileText} label="Notatki">
        <textarea name="notatki" rows={3} placeholder="np. Dobra gra lewÄ… nogÄ…" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 resize-none" />
      </FormField>

      <div className="pt-2">
        <SubmitButton loadingLabel="Zapisywanie...">
            <User className="w-4 h-4 flex-shrink-0" />
            <span>Zapisz zawodnika</span>
          </SubmitButton>
      </div>
    </form>
  );
}