'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Upload, X, AlertTriangle, CheckCircle2, FileText,
  Download, FileWarning, Info,
} from 'lucide-react';
import { importZawodnicy } from './actions';
import { parseImportText, type ParsedRowResult } from '@/lib/import-parser';

const PRZYKLAD = `Imię,Nazwisko,Rocznik,Numer,Pozycja,Kontakt
Jan,Kowalski,2012,7,Pomocnik,600 100 200
Adam,Nowak,2011,1,Bramkarz,600 300 400`;

const MAX_FILE_SIZE = 100 * 1024;

export function ImportForm() {
  const [text, setText] = useState('');
  const [wysylanie, setWysylanie] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseImportText(text), [text]);
  const maDane = !parsed.isEmpty;
  const moznaWyslac = parsed.validCount > 0 && parsed.validCount <= 200;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`Plik za duży (max ${MAX_FILE_SIZE / 1024} KB).`);
      return;
    }

    const buffer = await file.arrayBuffer();
    let decoded = new TextDecoder('utf-8', { fatal: false }).decode(buffer);

    if (decoded.includes('\uFFFD')) {
      try {
        decoded = new TextDecoder('windows-1250').decode(buffer);
        setFileError('Wykryto Windows-1250 — zdekodowano automatycznie.');
      } catch {
        setFileError('Nie udało się zdekodować pliku. Zapisz jako CSV UTF-8.');
        return;
      }
    }

    setText(decoded);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function downloadTemplate() {
    const csv =
      'Imię,Nazwisko,Rocznik,Numer,Pozycja,Kontakt\n' +
      'Jan,Kowalski,2012,7,Pomocnik,600 100 200\n' +
      'Adam,Nowak,2011,1,Bramkarz,600 300 400\n';
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'szablon-zawodnicy.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
      className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 lg:p-8 space-y-5 animate-fadeIn shadow-2xl shadow-black/60"
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-green-400" />
            Wklej dane lub wgraj plik CSV
          </label>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[11px] font-semibold transition-all self-start sm:self-auto"
          >
            <Download className="w-3 h-3" />
            Pobierz szablon CSV
          </button>
        </div>

        <textarea
          name="dane"
          value={text}
          onChange={(e) => { setText(e.target.value); setFileError(null); }}
          rows={12}
          wrap="off"
          placeholder={PRZYKLAD}
          className="w-full min-h-[240px] lg:min-h-[300px] bg-slate-950/60 border border-white/15 focus:border-green-400/60 rounded-xl px-3 md:px-4 py-3 text-xs md:text-sm text-white placeholder:text-white/30 outline-none transition-all font-mono leading-relaxed overflow-x-auto resize-y"
          spellCheck={false}
        />

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFile}
            className="hidden"
            id="csv-file"
          />
          <label
            htmlFor="csv-file"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Wgraj plik CSV
          </label>
          <p className="text-[11px] text-white/40 leading-relaxed self-center">
            Kolumny: tabulator, przecinek lub średnik. Max 200 wierszy, 100 KB.
          </p>
        </div>

        {fileError && (
          <div className="mt-2 rounded-lg bg-blue-500/10 border border-blue-400/30 px-3 py-2 text-[11px] text-blue-200 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{fileError}</span>
          </div>
        )}

        <details className="mt-3 text-[11px] text-white/50">
          <summary className="cursor-pointer hover:text-white/70 transition-colors">
            Jak przygotować plik z polskimi znakami?
          </summary>
          <div className="mt-2 pl-4 space-y-1 leading-relaxed">
            <p>
              Excel często zapisuje CSV w kodowaniu <strong className="text-white/70">Windows-1250</strong>, co psuje polskie znaki (ą, ę, ł, ś, ż...).
            </p>
            <p>Rozwiązania:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Zapisz plik jako <strong className="text-white/70">CSV UTF-8</strong> (Excel: Zapisz jako → CSV UTF-8 (rozdzielany przecinkami))</li>
              <li>Albo po prostu <strong className="text-white/70">skopiuj dane z Excela i wklej</strong> do pola powyżej — schowek zawsze jest w UTF-8</li>
              <li>Albo wgraj plik CSV — wykryjemy Windows-1250 i automatycznie zdekodujemy</li>
            </ul>
          </div>
        </details>
      </div>

      {maDane && parsed.encodingIssue && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3 flex items-start gap-2">
          <FileWarning className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong>Wykryto możliwy problem z kodowaniem polskich znaków.</strong>
            <br />
            Prawdopodobnie plik jest w Windows-1250. Zapisz go jako <strong>CSV UTF-8</strong> albo skopiuj dane bezpośrednio z Excela.
          </div>
        </div>
      )}

      {maDane && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              Podgląd importu
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-400/30 text-green-300 font-semibold">
                ✓ {parsed.validCount} {parsed.validCount === 1 ? 'gotowy' : 'gotowych'}
              </span>
              {parsed.errorCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-400/30 text-red-300 font-semibold">
                  ❌ {parsed.errorCount} {parsed.errorCount === 1 ? 'błąd' : 'błędów'}
                </span>
              )}
            </div>
          </div>

          <PreviewTable rows={parsed.rows} />

          {parsed.errorCount > 0 && parsed.validCount > 0 && (
            <p className="text-[11px] text-amber-200/80">
              Wiersze z błędami zostaną pominięte. Zaimportujemy tylko {parsed.validCount} poprawnych.
            </p>
          )}
        </div>
      )}

      {parsed.validCount > 200 && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-xs text-red-200">
          ⚠️ Za dużo zawodników naraz ({parsed.validCount}). Maksymalnie 200. Podziel na partie.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
            : parsed.validCount > 0
            ? `Importuj ${parsed.validCount}`
            : 'Importuj'}
        </button>
      </div>
    </form>
  );
}

function PreviewTable({ rows }: { rows: ParsedRowResult[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
      <table className="w-full text-[11px] md:text-xs min-w-[640px]">
        <thead className="bg-slate-950/80 border-b border-white/10">
          <tr className="text-left text-white/50 uppercase tracking-wider font-semibold">
            <th className="px-2 py-2 w-8">#</th>
            <th className="px-2 py-2">Imię</th>
            <th className="px-2 py-2">Nazwisko</th>
            <th className="px-2 py-2 w-16">Rocznik</th>
            <th className="px-2 py-2 w-12">Nr</th>
            <th className="px-2 py-2">Pozycja</th>
            <th className="px-2 py-2 min-w-[140px]">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const err = r.status === 'error';
            return (
              <tr
                key={r.line}
                className={`border-b border-white/5 ${
                  err ? 'bg-red-500/10' : 'hover:bg-white/5'
                }`}
              >
                <td className={`px-2 py-1.5 tabular-nums ${err ? 'text-red-300' : 'text-white/40'}`}>
                  {r.line}
                </td>
                <td className={`px-2 py-1.5 truncate max-w-[120px] ${err ? 'text-red-200' : 'text-white'}`}>
                  {r.displayData.imie || '—'}
                </td>
                <td className={`px-2 py-1.5 truncate max-w-[140px] ${err ? 'text-red-200' : 'text-white'}`}>
                  {r.displayData.nazwisko || '—'}
                </td>
                <td className={`px-2 py-1.5 tabular-nums ${err ? 'text-red-200' : 'text-white/70'}`}>
                  {r.displayData.rocznik || '—'}
                </td>
                <td className={`px-2 py-1.5 tabular-nums ${err ? 'text-red-200' : 'text-white/70'}`}>
                  {r.displayData.numer || '—'}
                </td>
                <td className={`px-2 py-1.5 truncate max-w-[100px] ${err ? 'text-red-200' : 'text-white/70'}`}>
                  {r.displayData.pozycja || '—'}
                </td>
                <td className="px-2 py-1.5">
                  {err ? (
                    <span
                      className="inline-flex items-center gap-1 text-red-300"
                      title={r.messages.join('\n')}
                    >
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{r.messages[0]}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      OK
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}