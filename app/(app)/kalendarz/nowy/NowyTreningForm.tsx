'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { dodajTrening } from './actions';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  FileText,
  Save,
  Repeat,
  ExternalLink,
  X,
} from 'lucide-react';
import { TimePicker } from '@/components/TimePicker';
import { DatePicker } from '@/components/DatePicker';
import { Select } from '@/components/Select';
import { FormField } from '@/components/FormField';
import { SubmitButton } from '@/components/SubmitButton';

export function NowyTreningForm({ defaultData }: { defaultData?: string }) {
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
  const [miejsce, setMiejsce] = useState('');

  const cyklDostepny = typ === 'trening';

  const mapsUrl = miejsce.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(miejsce.trim())}`
    : null;

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

    return `Zostanie utworzonych ${liczba} ${slowo} - od ${format(
      startDate
    )} do ${format(endDate)}.`;
  }, [cyklDostepny, cykl, data, dataDo]);

  return (
    <form
      action={dodajTrening}
      className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60"
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField icon={CalendarIcon} label="Data" required>
          <DatePicker name="data" value={data} onChange={setData} />
        </FormField>
        <FormField icon={Clock} label="Godzina" required>
          <TimePicker name="godzina" defaultValue="18:00" />
        </FormField>
      </div>

      <FormField icon={Trophy} label="Typ wydarzenia" required>
        <Select
          name="typ"
          value={typ}
          onChange={(v) => {
            setTyp(v);
            if (v !== 'trening') setCykl('nie_powtarzaj');
          }}
          options={[
            { value: 'trening', label: '🏦 Trening' },
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

      <FormField icon={Trophy} label="Przeciwnik (dla meczu/sparingu)">
        <input
          name="przeciwnik"
          placeholder="np. Orzeł Warszawa"
          className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2"
        />
      </FormField>

      <FormField icon={FileText} label="Notatki">
        <textarea
          name="notatki"
          rows={3}
          placeholder="np. Zbiórka 17:30"
          className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2 resize-none"
        />
      </FormField>

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

          <FormField icon={Repeat} label="Powtarzaj">
            <Select
              name="cykl"
              value={cykl}
              onChange={setCykl}
              options={[
                { value: 'nie_powtarzaj', label: 'Nie powtarzaj (jednorazowo)' },
                { value: 'co_tydzien', label: 'Co tydzień' },
                { value: 'co_2_tygodnie', label: 'Co 2 tygodnie' },
              ]}
            />
          </FormField>

          {cykl !== 'nie_powtarzaj' && (
            <FormField icon={CalendarIcon} label="Do kiedy" required>
              <DatePicker
                name="data_do"
                value={dataDo}
                onChange={setDataDo}
                required
              />
            </FormField>
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

      {/* Zapisz + Anuluj obok siebie */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Link
          href="/kalendarz"
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold py-3.5 rounded-2xl transition-all text-sm md:text-base"
        >
          <X className="w-4 h-4 flex-shrink-0" />
          Anuluj
        </Link>
        <div className="flex-1">
          <SubmitButton icon={Save} label="Zapisz wydarzenie" loadingLabel="Zapisywanie..." />
        </div>
      </div>
    </form>
  );
}