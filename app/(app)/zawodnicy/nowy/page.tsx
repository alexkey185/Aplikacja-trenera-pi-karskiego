import Link from 'next/link';
import { dodajZawodnika } from './actions';
import { Select } from '@/components/Select';
import { FormField } from '@/components/FormField';
import { ArrowLeft, User, Hash, Trophy, Phone, FileText, Save, Users } from 'lucide-react';

export default function NowyZawodnik() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-3 animate-fadeIn">
        <Link href="/kadra" className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Nowy zawodnik</h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">Dodaj do składu drużyny</p>
          </div>
        </div>
      </header>

      <form action={dodajZawodnika} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField icon={User} label="Imię" required>
            <input name="imie" required placeholder="np. Kamil" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
          </FormField>
          <FormField icon={User} label="Nazwisko" required>
            <input name="nazwisko" required placeholder="np. Nowak" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField icon={Trophy} label="Rocznik">
            <input name="rocznik" type="number" placeholder="2012" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
          </FormField>
          <FormField icon={Hash} label="Numer">
            <input name="numer" type="number" placeholder="7" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
          </FormField>
        </div>

        <FormField icon={Trophy} label="Pozycja">
          <Select
            name="pozycja"
            defaultValue=""
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
          <input name="kontakt_rodzica" type="tel" placeholder="600 100 200" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
        </FormField>

        <FormField icon={FileText} label="Notatki">
          <textarea name="notatki" rows={3} placeholder="np. Dobra gra lewą nogą" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 resize-none" />
        </FormField>

        <button type="submit" className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5">
          <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Zapisz zawodnika
        </button>
      </form>
    </div>
  );
}