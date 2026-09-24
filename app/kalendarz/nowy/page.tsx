import Link from 'next/link';
import { dodajTrening } from './actions';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  FileText,
  Save,
  Plus,
} from 'lucide-react';

export default function NowyTrening() {
  const dzis = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen text-white p-4 md:p-6 pb-28">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center gap-3 animate-fadeIn">
          <Link
            href="/kalendarz"
            className="w-10 h-10 rounded-xl glass flex items-center justify-center transition-colors hover:bg-slate-800/70"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Nowe wydarzenie
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Trening, mecz, sparing lub turniej
              </p>
            </div>
          </div>
        </header>

        <form
          action={dodajTrening}
          className="glass rounded-3xl p-6 space-y-5 animate-fadeIn"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field icon={CalendarIcon} label="Data" required>
              <input
                name="data"
                type="date"
                required
                defaultValue={dzis}
                className="w-full bg-transparent border-0 outline-none text-white py-2 [color-scheme:dark]"
              />
            </Field>
            <Field icon={Clock} label="Godzina" required>
              <input
                name="godzina"
                type="time"
                required
                defaultValue="18:00"
                className="w-full bg-transparent border-0 outline-none text-white py-2 [color-scheme:dark]"
              />
            </Field>
          </div>

          <Field icon={Trophy} label="Typ wydarzenia" required>
            <select
              name="typ"
              required
              defaultValue="trening"
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
              placeholder="np. Boisko Orlik"
              className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2"
            />
          </Field>

          <Field icon={Trophy} label="Przeciwnik (dla meczu/sparingu)">
            <input
              name="przeciwnik"
              placeholder="np. Orzeł Warszawa"
              className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2"
            />
          </Field>

          <Field icon={FileText} label="Notatki">
            <textarea
              name="notatki"
              rows={3}
              placeholder="np. Zbiórka 17:30, zabrać żółte koszulki"
              className="w-full bg-transparent border-0 outline-none text-white placeholder:text-slate-600 py-2 resize-none"
            />
          </Field>

          <button
            type="submit"
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-900/50 hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Zapisz wydarzenie
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