'use client';

import { useMemo, useState } from 'react';
import { dodajTrening } from './actions';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  FileText,
  Save,
  Repeat,
} from 'lucide-react';

export function NowyTreningForm({ defaultData }: { defaultData?: string }) {
  // Bezpieczne pobieranie dzisiejszej daty w lokalnej strefie czasowej
  const dzis = defaultData ?? new Date().toLocaleDateString('sv-SE');
  const zaMiesiac = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('sv-SE');
  })();

  const [data, setData] = useState(dzis);
  const [typ, setTyp] = useState('trening');
  const [cykl, setCykl] = useState('nie_powtarzaj');
  const [dataDo, setDataDo] = useState(zaMiesiac);

  // Cykliczność dostępna tylko dla treningu
  const cyklDostepny = typ === 'trening';

  const info = useMemo(() => {
    if (!cyklDostepny || cykl === 'nie_powtarzaj') return null;

    const startDate = new Date(data + 'T00:00:00');
    const endDate = new Date(dataDo + 'T00:00:00');

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Wybierz poprawną datę.';
    }
    if (endDate < startDate) {
      return 'Data końcowa musi być po dacie startu.';
    }

    const stepDays = cykl === 'co_2_tygodnie' ? 14 : 7;
    const diffDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const liczba = Math.floor(diffDays / stepDays) + 1;

    if (liczba < 2) {
      return 'Data końcowa daje tylko 1 wystąpienie. Zwiększ zakres lub wybierz „Nie powtarzaj".';
    }
    if (liczba > 52) {
      return `Zbyt dużo wystąpień (${liczba}). Skróć zakres do maksymalnie roku.`;
    }

    const format = (d: Date) =>
      d.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    const slowo =
      liczba === 1 ? 'wydarzenie' : liczba < 5 ? 'wydarzenia' : 'wydarzeń';

    return `Zostanie utworzonych ${liczba} ${slowo} — od ${format(
      startDate
    )} do ${format(endDate)}.`;
  }, [cyklDostepny, cykl, data, dataDo]);

  return (
    <form
      action={dodajTrening}
      className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field icon={CalendarIcon} label="Data" required>
          <input
            name="data"
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
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
          value={typ}
          onChange={(e) => {
            setTyp(e.target.value);
            // Reset cykliczności gdy zmieniamy na coś innego niż trening
            if (e.target.value !== 'trening') {
              setCykl('nie_powtarzaj');
            }
          }}
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
          className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2"
        />
      </Field>

      <Field icon={Trophy} label="Przeciwnik (dla meczu/sparingu)">
        <input
          name="przeciwnik"
          placeholder="np. Orzeł Warszawa"
          className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2"
        />
      </Field>

      <Field icon={FileText} label="Notatki">
        <textarea
          name="notatki"
          rows={3}
          placeholder="np. Zbiórka 17:30"
          className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 resize-none"
        />
      </Field>

      {/* CYKLICZNOŚĆ — tylko dla treningu */}
      {cyklDostepny && (
        <div className="pt-5 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
              Cykliczność
            </span>
            <span className="text-[10px] text-white/40 ml-auto">
              (tylko dla treningu)
            </span>
          </div>

          <Field icon={Repeat} label="Powtarzaj">
            <select
              name="cykl"
              value={cykl}
              onChange={(e) => setCykl(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-white py-2 [&>option]:bg-slate-800"
            >
              <option value="nie_powtarzaj">Nie powtarzaj (jednorazowo)</option>
              <option value="co_tydzien">Co tydzień</option>
              <option value="co_2_tygodnie">Co 2 tygodnie</option>
            </select>
          </Field>

          {cykl !== 'nie_powtarzaj' && (
            <Field icon={CalendarIcon} label="Do kiedy" required>
              <input
                name="data_do"
                type="date"
                required
                value={dataDo}
                onChange={(e) => setDataDo(e.target.value)}
                min={data}
                className="w-full bg-transparent border-0 outline-none text-white py-2 [color-scheme:dark]"
              />
            </Field>
          )}

          {info && (
            <div
              className={`rounded-xl px-4 py-3 text-xs flex items-start gap-2 border ${
                info.startsWith('Zostanie')
                  ? 'bg-green-500/10 border-green-400/30 text-green-300'
                  : 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5"
      >
        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Zapisz wydarzenie
      </button>
    </form>
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