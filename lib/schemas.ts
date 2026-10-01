import { z } from 'zod';

// ═══════════════════════════════════════════════════
// HELPERY
// ═══════════════════════════════════════════════════

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

const optionalNumber = (min: number, max: number) =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === '' || v === null || v === undefined) return null;
      const n = typeof v === 'string' ? parseInt(v, 10) : v;
      return isNaN(n) ? null : n;
    })
    .refine((n) => n === null || (n >= min && n <= max), {
      message: `Wartość musi być między ${min} a ${max}`,
    });

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty (YYYY-MM-DD)');

const isoTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Nieprawidłowy format godziny (HH:MM)');

// ═══════════════════════════════════════════════════
// TRENINGI
// ═══════════════════════════════════════════════════

export const TYP_TRENINGU = ['trening', 'mecz', 'sparing', 'turniej'] as const;
export const CYKL_TRENINGU = ['nie_powtarzaj', 'co_tydzien', 'co_2_tygodnie'] as const;

export const dodajTreningSchema = z
  .object({
    data: isoDate,
    godzina: isoTime,
    miejsce: optionalString(200),
    typ: z.enum(TYP_TRENINGU).default('trening'),
    przeciwnik: optionalString(100),
    notatki: optionalString(2000),
    cykl: z.enum(CYKL_TRENINGU).default('nie_powtarzaj'),
    data_do: z
      .union([isoDate, z.literal(''), z.undefined()])
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
  })
  .refine(
    (d) => {
      // Jeśli cykl != nie_powtarzaj, data_do musi być
      if (d.typ === 'trening' && d.cykl !== 'nie_powtarzaj') {
        return !!d.data_do;
      }
      return true;
    },
    { message: 'Wybierz datę końcową dla cyklu', path: ['data_do'] }
  );

export type DodajTreningInput = z.infer<typeof dodajTreningSchema>;

export const aktualizujTreningSchema = z.object({
  data: isoDate,
  godzina: isoTime,
  miejsce: optionalString(200),
  typ: z.enum(TYP_TRENINGU),
  przeciwnik: optionalString(100),
  notatki: optionalString(2000),
});

export type AktualizujTreningInput = z.infer<typeof aktualizujTreningSchema>;

// ═══════════════════════════════════════════════════
// ZAWODNICY
// ═══════════════════════════════════════════════════

export const POZYCJE = ['Bramkarz', 'Obrońca', 'Pomocnik', 'Napastnik'] as const;

export const dodajZawodnikaSchema = z.object({
  imie: z.string().trim().min(2, 'Imię musi mieć min. 2 znaki').max(50),
  nazwisko: z.string().trim().min(2, 'Nazwisko musi mieć min. 2 znaki').max(50),
  rocznik: optionalNumber(1900, 2100),
  pozycja: z
    .union([z.enum(POZYCJE), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v === undefined ? null : v)),
  numer: optionalNumber(1, 99),
  kontakt_rodzica: optionalString(20),
  notatki: optionalString(2000),
});

export type DodajZawodnikaInput = z.infer<typeof dodajZawodnikaSchema>;

// ═══════════════════════════════════════════════════
// DRUŻYNY
// ═══════════════════════════════════════════════════

export const KOLORY_DRUZYNY = [
  'green',
  'blue',
  'purple',
  'orange',
  'red',
  'yellow',
  'pink',
  'slate',
] as const;

export const dodajDruzynaSchema = z.object({
  nazwa: z.string().trim().min(2, 'Nazwa musi mieć min. 2 znaki').max(80),
  rocznik: optionalNumber(1900, 2100),
  kolor: z.enum(KOLORY_DRUZYNY).default('green'),
});

export type DodajDruzynaInput = z.infer<typeof dodajDruzynaSchema>;

// ═══════════════════════════════════════════════════
// HELPER do parsowania FormData
// ═══════════════════════════════════════════════════

/**
 * Parsuje FormData i waliduje przez Zod.
 * Rzuca Error z czytelnym komunikatem gdy walidacja się nie powiedzie.
 */
export function parseFormData<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): z.infer<T> {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') raw[key] = value;
  }

  const result = schema.safeParse(raw);

  if (!result.success) {
    const pierwszy = result.error.issues[0];
    throw new Error(pierwszy.message);
  }

  return result.data;
}