import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { aktualizujZawodnika } from './actions';
import { DeleteButton } from './DeleteButton';
import { Select } from '@/components/Select';
import { FormField } from '@/components/FormField';
import { ArrowLeft, User, Hash, Trophy, Phone, FileText, Save, Pencil } from 'lucide-react';

export default async function EdytujZawodnika({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const supabase = await createClient();
  const { data: zawodnik, error } = await supabase.from('zawodnicy').select('*').eq('id', idNum).single();
  if (error || !zawodnik) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-3 animate-fadeIn">
        <Link href={`/zawodnicy/${idNum}`} className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
              <Pencil className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Edytuj zawodnika</h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">{zawodnik.imie} {zawodnik.nazwisko}</p>
          </div>
        </div>
      </header>

      <form action={aktualizujZawodnika.bind(null, idNum)} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField icon={User} label="Imię" required>
            <input name="imie" required defaultValue={zawodnik.imie} className="w-full bg-transparent border-0 outline-none text-white py-2" />
          </FormField>
          <FormField icon={User} label="Nazwisko" required>
            <input name="nazwisko" required defaultValue={zawodnik.nazwisko} className="w-full bg-transparent border-0 outline-none text-white py-2" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField icon={Trophy} label="Rocznik">
            <input name="rocznik" type="number" defaultValue={zawodnik.rocznik ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2" />
          </FormField>
          <FormField icon={Hash} label="Numer">
            <input name="numer" type="number" defaultValue={zawodnik.numer ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2" />
          </FormField>
        </div>

        <FormField icon={Trophy} label="Pozycja">
          <Select
            name="pozycja"
            defaultValue={zawodnik.pozycja ?? ''}
            options={[
              { value: '', label: '— wybierz —' },
              { value: 'Bramkarz', label: '🧤 Bramkarz' },
              { value: 'Obrońca', label: '🛡️ Obrońca' },
              { value: 'Pomocnik', label: '⚙️ Pomocnik' },
              { value: 'Napastnik', label: '⚡ Napastnik' },
            ]}
          />
        </FormField>

        <FormField icon={Phone} label="Kontakt do rodzica">
          <input name="kontakt_rodzica" type="tel" defaultValue={zawodnik.kontakt_rodzica ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2" />
        </FormField>

        <FormField icon={FileText} label="Notatki">
          <textarea name="notatki" rows={3} defaultValue={zawodnik.notatki ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2 resize-none" />
        </FormField>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5">
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Zapisz zmiany
          </button>
          <DeleteButton id={idNum} />
        </div>
      </form>
    </div>
  );
}