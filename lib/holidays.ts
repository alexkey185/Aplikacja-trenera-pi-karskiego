// Algorytm Meeusa/Gaussa dla Wielkanocy — działa dla dowolnego roku
function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function getPolishHolidays(year: number): Set<string> {
  const holidays = new Set<string>([
    `${year}-01-01`, // Nowy Rok
    `${year}-01-06`, // Trzech Króli
    `${year}-05-01`, // Święto Pracy
    `${year}-05-03`, // Konstytucji 3 Maja
    `${year}-08-15`, // Wniebowzięcie NMP
    `${year}-11-01`, // Wszystkich Świętych
    `${year}-11-11`, // Niepodległości
    `${year}-12-25`, // Boże Narodzenie
    `${year}-12-26`, // Boże Narodzenie (2. dzień)
  ]);

  // Święta ruchome
  const easterSun = easter(year);
  const easterISO = toISO(easterSun);
  holidays.add(easterISO);                  // Wielkanoc
  holidays.add(addDaysISO(easterISO, 1));    // Poniedziałek Wielkanocny
  holidays.add(addDaysISO(easterISO, 49));   // Zielone Świątki
  holidays.add(addDaysISO(easterISO, 60));   // Boże Ciało

  return holidays;
}