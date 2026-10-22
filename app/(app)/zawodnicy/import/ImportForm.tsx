'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Upload, X, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { importZawodnicy } from './actions';
import { parseImportText } from '@/lib/import-parser';

const PRZYKLAD = `Imię,Nazwisko,Rocznik,Numer,Pozycja,Kontakt
Jan,Kowalski,2012,7,Pomocnik,600 100 200
Adam,Nowak,2011,1,Bramkarz,600 300 400`;

export function ImportForm() {
  const [text, setText] = useState('');
  const [wysylanie, setWysylanie] = useState(false);

  const parsed = useMemo(() => {
    if (!text.trim()) return { rows: [], errors: [] };
    return parseImportText(text);
  }, [text]);

  const { rows, errors } = parsed;
  const maDane = text.trim().length > 0;
  const moznaWyslac = rows.length > 0 && rows.length <= 200;

  return (
    <form
      action={async (formData) => {
        setWysylanie(true);
        try {
          await importZawodnicy(formData);
        } finally {
          setWysylanie(false);
        }
      }}
      className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60"
    >
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
          <FileText className="w-3.5 h-3.5 text-green-400" />
          Wklej dane z Excela / Google Sheets
        </label>
        <textarea
          name="dane"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={PRZYKLAD}
          className="w-full bg-slate-950/60 border border-white/15 focus:border-green-400/60 rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all font-mono"
          spellCheck={false}
        />
        <p className="text-[10px] text-white/40 mt-2 leading-relaxed">
          Kolumny oddzielone tabulatorem, przecinkiem lub średnikiem.
          <br />
          Kolejność: <strong className="text-white/70">Imię, Nazwisko, Rocznik, Numer, Pozycja, Kontakt</strong>{' '}
          (tylko Imię i Nazwisko są wymagane, reszta opcjonalna).
          <br />
          Wiersz nagłówka (np. „Imię,Nazwisko...”) jest pomijany automatycznie.
        </p>
      </div>

      {maDane && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            Podgląd ({rows.length} {rows.length === 1 ? 'zawodnik' : 'zawodników'})
          </div>

          {rows.length > 0 && (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto">
              {rows.slice(0, 20).map((r, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-400/20 text-xs"
                >
                  <span className="w-5 text-white/40 tabular-nums flex-shrink-0">{i + 1}.</span>
                  <span className="font-semibold text-white truncate">
                    {r.imie} {r.nazwisko}
                  </span>
                  <span className="text-white/40 truncate ml-auto flex-shrink-0">
                    {r.rocznik ?? '—'}
                    {r.numer != null && ` · #${r.numer}`}
                    {r.pozycja && ` · ${r.pozycja}`}
                  </span>
                </li>
              ))}
              {rows.length > 20 && (
                <li className="text-center text-[10px] text-white/40 py-2">
                  ... i {rows.length - 20} więcej
                </li>
              )}
            </ul>
          )}

          {errors.length > 0 && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Pominięto {errors.length} {errors.length === 1 ? 'wiersz' : 'wierszy'}
              </div>
              <ul className="text-[11px] text-amber-200/80 space-y-0.5 max-h-32 overflow-y-auto">
                {errors.slice(0, 10).map((e, i) => (
                  <li key={i}>
                    <strong className="text-amber-200">Wiersz {e.line}:</strong> {e.msg}
                  </li>
                ))}
                {errors.length > 10 && (
                  <li className="text-amber-200/60">... i {errors.length - 10} więcej</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {rows.length > 200 && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-xs text-red-200">
          ⚠️ Za dużo zawodników naraz ({rows.length}). Maksymalnie 200. Podziel na partie.
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Link
          href="/kadra"
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold py-3.5 rounded-2xl transition-all text-sm md:text-base"
        >
          <X className="w-4 h-4 flex-shrink-0" />
          Anuluj
        </Link>
        <button
          type="submit"
          disabled={!moznaWyslac || wysylanie}
          className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none text-sm md:text-base"
        >
          <Upload className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
          {wysylanie
            ? 'Importowanie...'
            : moznaWyslac
            ? `Importuj ${rows.length}`
            : 'Importuj'}
        </button>
      </div>
    </form>
  );
}