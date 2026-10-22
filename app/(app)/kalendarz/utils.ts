// app/(app)/kalendarz/utils.ts
export const pad2 = (n: number) => String(n).padStart(2, '0');

export const toISO = (y: number, m: number, d: number) =>
  `${y}-${pad2(m + 1)}-${pad2(d)}`;

export const getLocalISO = (date: Date = new Date()) =>
  toISO(date.getFullYear(), date.getMonth(), date.getDate());

export const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const daysInMonth = (y: number, m: number) =>
  new Date(y, m + 1, 0).getDate();

export const firstWeekdayMon = (y: number, m: number) => {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

export const formatShort = (iso: string) => {
  const d = parseISO(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
};

export function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}