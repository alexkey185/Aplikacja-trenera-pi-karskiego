// lib/dates.ts
export const TIMEZONE = 'Europe/Warsaw' as const;

// ═══════════════════════════════════════════════════════════════
// CACHE FORMATTERÓW Intl
//
// `toLocaleDateString('sv-SE', { timeZone })` tworzy nowy
// Intl.DateTimeFormat przy KAŻDYM wywołaniu. To ~5-10x wolniejsze
// niż reużycie formattera. Na mobile (wolny CPU) odczuwalne
// przy renderach list z wieloma datami.
//
// `format()` dla 'sv-SE' zwraca dokładnie YYYY-MM-DD (ISO).
// ═══════════════════════════════════════════════════════════════
const DZIS_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TIMEZONE,
});

export const pad2 = (n: number): string => String(n).padStart(2, '0');

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function getDzisISO(): string {
  return DZIS_FORMATTER.format(new Date());
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplay(iso: string): string {
  if (!iso) return '';
  const d = parseISO(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function formatShort(iso: string): string {
  const d = parseISO(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function firstWeekdayMon(y: number, m: number): number {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export function buildISO(y: number, m: number, d: number): string {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

export function isValidISO(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

export const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
] as const;

export const MONTHS_PL_GENITIVE = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
] as const;

export const DAYS_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'] as const;

export const DAYS_LONG = [
  'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa',
  'Czwartek', 'Piątek', 'Sobota',
] as const;

export function formatDlugiePL(iso: string): string {
  return parseISO(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatPelnePL(iso: string): string {
  return parseISO(iso).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatMiesiacRok(date: Date): string {
  return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}