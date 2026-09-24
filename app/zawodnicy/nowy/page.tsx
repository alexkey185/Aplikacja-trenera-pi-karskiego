import Link from 'next/link';
import { dodajZawodnika } from './actions';
import { ArrowLeft, User, Hash, Trophy, Phone, FileText, Save, Users } from 'lucide-react';

export default function NowyZawodnik() {
  return (
    <main className="min-h-screen text-white p-4 md:p-6 pb-28">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center gap-3 animate-fadeIn">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl glass flex items-center justify-center transition-colors hover:bg-slate-800/70"
          >
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
              <h1 className="text-xl font-bold leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Nowy zawodnik
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dodaj do składu drużyny
              </p>
            </div>
          </div>
        </header>

        <form
          action={dodajZawodnika}
          className="glass rounded-3xl p-6 space-y-5 animate-fadeIn"
        >
          {/* Imię i nazwisko — 2 kolumny */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={User} label="Imię" required>
              <input
                name="imie"
                required
                placeholder="np. Kamil"
                className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2"
              />
            </Field>
            <Field icon={User} label="Nazwisko" required>
              <input
                name="nazwisko"
                required
                placeholder="np. Nowak"
                className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2"
              />
            </Field>
          </div>

          {/* Rocznik i numer — 2 kolumny */}
          <div className="grid grid-cols-2 gap-4">
            <Field icon={Trophy} label="Rocznik">
              <input
                name="rocznik"
                type="number"
                placeholder="2012"
                className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2"
              />
            </Field>
            <Field icon={Hash} label="Numer">
              <input
                name="numer"
                type="number"
                placeholder="7"
                className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2"
              />
            </Field>
          </div>

          {/* Pozycja */}
          <Field icon={Trophy} label="Pozycja">
            <select
              name="pozycja"
              className="w-full bg-transparent border-0 outline-none text-white py-2 [&>option]:bg-slate-800"
            >
              <option value="">— wybierz —</option>
              <option value="Bramkarz">🧤 Bramkarz</option>
              <option value="Obrońca">🛡️ Obrońca</option>
              <option value="Pomocnik">⚙️ Pomocnik</option>
              <option value="Napastnik">⚡ Napastnik</option>
            </select>
          </Field>

          {/* Kontakt */}
          <Field icon={Phone} label="Kontakt do rodzica">
            <input
              name="kontakt_rodzica"
              type="tel"
              placeholder="600 100 200"
              className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2"
            />
          </Field>

          {/* Notatki */}
          <Field icon={FileText} label="Notatki">
            <textarea
              name="notatki"
              rows={3}
              placeholder="np. Dobra gra lewą nogą, silny w pojedynkach"
              className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2 resize-none"
            />
          </Field>

          <button
            type="submit"
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-900/50 hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Zapisz zawodnika
          </button>
        </form>
      </div>
    </main>
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
        <Icon className="w-3.5 h-3.5 text-slate-500 group-focus-within:text-green-400 transition-colors" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
          {required && <span className="text-green-400 ml-1">*</span>}
        </span>
      </div>
      <div className="bg-slate-900/60 border border-slate-700/50 focus-within:border-green-500/50 focus-within:bg-slate-900 rounded-xl px-3 transition-all">
        {children}
      </div>
    </label>
  );
}