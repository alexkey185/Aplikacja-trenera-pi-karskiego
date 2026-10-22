// lib/import-parser.ts
import { dodajZawodnikaSchema } from './schemas';

export type ParsedRow = {
  imie: string;
  nazwisko: string;
  rocznik: number | null;
  numer: number | null;
  pozycja: string | null;
  kontakt_rodzica: string | null;
  notatki: string | null;
};

export type ParseError = { line: number; msg: string };

export type ParseResult = {
  rows: ParsedRow[];
  errors: ParseError[];
};

const POZYCJE_MAP: Record<string, string> = {
  br: 'Bramkarz',
  bramkarz: 'Bramkarz',
  goalkeeper: 'Bramkarz',
  gk: 'Bramkarz',
  ob: 'Obrońca',
  obronca: 'Obrońca',
  obrońca: 'Obrońca',
  defender: 'Obrońca',
  df: 'Obrońca',
  po: 'Pomocnik',
  pomocnik: 'Pomocnik',
  midfielder: 'Pomocnik',
  mf: 'Pomocnik',
  na: 'Napastnik',
  napastnik: 'Napastnik',
  forward: 'Napastnik',
  fw: 'Napastnik',
  striker: 'Napastnik',
};

function normalizujPozycje(raw: string | undefined): string {
  if (!raw) return '';
  const key = raw.trim().toLowerCase();
  return POZYCJE_MAP[key] ?? raw.trim();
}

function wybierzSeparator(line: string): string {
  if (line.includes('\t')) return '\t';
  if (line.includes(';')) return ';';
  return ',';
}

export function parseImportText(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows: ParsedRow[] = [];
  const errors: ParseError[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const sep = wybierzSeparator(line);
    const parts = line.split(sep).map((p) => p.trim().replace(/^"|"$/g, ''));

    if (i === 0) {
      const first = parts[0]?.toLowerCase() ?? '';
      if (
        first === 'imię' ||
        first === 'imie' ||
        first === 'name' ||
        first === 'first name' ||
        first === 'imiona'
      ) {
        continue;
      }
    }

    if (parts.length < 2) {
      errors.push({
        line: i + 1,
        msg: 'Za mało kolumn (wymagane: Imię i Nazwisko)',
      });
      continue;
    }

    const [imie, nazwisko, rocznik, numer, pozycja, kontakt] = parts;

    const result = dodajZawodnikaSchema.safeParse({
      imie: imie ?? '',
      nazwisko: nazwisko ?? '',
      rocznik: rocznik ?? '',
      numer: numer ?? '',
      pozycja: normalizujPozycje(pozycja),
      kontakt_rodzica: kontakt ?? '',
      notatki: '',
    });

    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Nieprawidłowe dane';
      errors.push({ line: i + 1, msg });
      continue;
    }

    rows.push({
      imie: result.data.imie,
      nazwisko: result.data.nazwisko,
      rocznik: result.data.rocznik,
      numer: result.data.numer,
      pozycja: result.data.pozycja,
      kontakt_rodzica: result.data.kontakt_rodzica,
      notatki: result.data.notatki,
    });
  }

  return { rows, errors };
}