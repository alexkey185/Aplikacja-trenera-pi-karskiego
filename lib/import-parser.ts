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

export type RowDisplay = {
  imie: string;
  nazwisko: string;
  rocznik: string;
  numer: string;
  pozycja: string;
  kontakt: string;
};

export type RowStatus = 'valid' | 'error';

export type ParsedRowResult = {
  line: number;
  displayData: RowDisplay;
  data: ParsedRow | null;
  status: RowStatus;
  messages: string[];
};

export type ParseResult = {
  rows: ParsedRowResult[];
  validCount: number;
  errorCount: number;
  totalLines: number;
  isEmpty: boolean;
  encodingIssue: boolean;
};

const POZYCJE_MAP: Record<string, string> = {
  br: 'Bramkarz', bramkarz: 'Bramkarz', goalkeeper: 'Bramkarz', gk: 'Bramkarz',
  ob: 'Obrońca', obronca: 'Obrońca', obrońca: 'Obrońca', defender: 'Obrońca', df: 'Obrońca',
  po: 'Pomocnik', pomocnik: 'Pomocnik', midfielder: 'Pomocnik', mf: 'Pomocnik',
  na: 'Napastnik', napastnik: 'Napastnik', forward: 'Napastnik', fw: 'Napastnik', striker: 'Napastnik',
};

function normalizujPozycje(raw: string | undefined): string {
  if (!raw) return '';
  const key = raw.trim().toLowerCase();
  return POZYCJE_MAP[key] ?? raw.trim();
}

export function detectEncodingIssue(text: string): boolean {
  if (text.includes('\uFFFD')) return true;
  const suspects = ['Ĺ', 'Ä', 'Ă', 'Å', 'Â'];
  let count = 0;
  for (const s of suspects) {
    if (text.includes(s)) count++;
  }
  return count >= 1;
}

export function parseImportText(text: string): ParseResult {
  const rows: ParsedRowResult[] = [];
  let validCount = 0;
  let errorCount = 0;

  if (!text.trim()) {
    return {
      rows, validCount: 0, errorCount: 0, totalLines: 0,
      isEmpty: true, encodingIssue: false,
    };
  }

  const encodingIssue = detectEncodingIssue(text);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i === 0) {
      const firstWord = line.split(/[,\t;]/)[0]?.trim().toLowerCase() ?? '';
      if (['imię', 'imie', 'name', 'first name', 'imiona'].includes(firstWord)) continue;
    }

    const sep = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
    const parts = line.split(sep).map((p) => p.trim().replace(/^"|"$/g, ''));
    const [imie, nazwisko, rocznik, numer, pozycja, kontakt] = parts;

    const displayData: RowDisplay = {
      imie: imie ?? '',
      nazwisko: nazwisko ?? '',
      rocznik: rocznik ?? '',
      numer: numer ?? '',
      pozycja: pozycja ?? '',
      kontakt: kontakt ?? '',
    };

    const messages: string[] = [];

    if (!imie || imie.length < 2) messages.push('Brak imienia (min. 2 znaki)');
    if (!nazwisko || nazwisko.length < 2) messages.push('Brak nazwiska (min. 2 znaki)');

    if (rocznik) {
      const r = parseInt(rocznik, 10);
      if (isNaN(r) || r < 1900 || r > 2100) {
        messages.push(`Nieprawidłowy rocznik "${rocznik}"`);
      }
    }
    if (numer) {
      const n = parseInt(numer, 10);
      if (isNaN(n) || n < 1 || n > 99) {
        messages.push(`Nieprawidłowy numer "${numer}"`);
      }
    }

    const zodResult = dodajZawodnikaSchema.safeParse({
      imie: imie ?? '',
      nazwisko: nazwisko ?? '',
      rocznik: rocznik ?? '',
      numer: numer ?? '',
      pozycja: normalizujPozycje(pozycja),
      kontakt_rodzica: kontakt ?? '',
      notatki: '',
    });

    if (!zodResult.success && messages.length === 0) {
      messages.push(zodResult.error.issues[0]?.message ?? 'Nieprawidłowe dane');
    }

    const status: RowStatus = messages.length > 0 ? 'error' : 'valid';
    if (status === 'valid') validCount++;
    else errorCount++;

    rows.push({
      line: i + 1,
      displayData,
      data: zodResult.success ? {
        imie: zodResult.data.imie,
        nazwisko: zodResult.data.nazwisko,
        rocznik: zodResult.data.rocznik ?? null,
        numer: zodResult.data.numer ?? null,
        pozycja: zodResult.data.pozycja ?? null,
        kontakt_rodzica: zodResult.data.kontakt_rodzica ?? null,
        notatki: zodResult.data.notatki ?? null,
      } : null,
      status,
      messages,
    });
  }

  return {
    rows, validCount, errorCount,
    totalLines: lines.length,
    isEmpty: false,
    encodingIssue,
  };
}

export function rowsToInsert(parsed: ParseResult): ParsedRow[] {
  return parsed.rows
    .filter((r) => r.status === 'valid' && r.data !== null)
    .map((r) => r.data!);
}

/**
 * Neutralizacja CSV injection dla przyszłego eksportu.
 * Wartości zaczynające się od = + - @ lub \t są prefiksowane apostrofem,
 * żeby Excel nie zinterpretował ich jako formuły.
 */
export function sanitizeForCsv(value: string | null | undefined): string {
  if (!value) return '';
  const firstChar = value[0];
  if (['=', '+', '-', '@', '\t', '\r'].includes(firstChar)) {
    return `'${value}`;
  }
  return value;
}