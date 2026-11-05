import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// HELPERY - pola opcjonalne
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// DATA - walidacja formatu + realnego istnienia
// ═══════════════════════════════════════════════════════════════

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty (YYYY-MM-DD)')
  .refine(
    (val) => {
      const [y, m, d] = val.split('-').map(Number);
      if (y < 1900 || y > 2100) return false;
      if (m < 1 || m > 12) return false;
      if (d < 1 || d > 31) return false;
      const date = new Date(y, m - 1, d);
      return (
        date.getFullYear() === y &&
        date.getMonth() === m - 1 &&
        date.getDate() === d
      );
    },
    { message: 'Nieprawidłowa data (np. 31 lutego nie istnieje)' }
  );

// ═══════════════════════════════════════════════════════════════
// GODZINA
// ═══════════════════════════════════════════════════════════════

const isoTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Nieprawidłowy format godziny (HH:MM)')
  .refine(
    (val) => {
      const [h, m] = val.split(':').map(Number);
      return h >= 0 && h <= 23 && m >= 0 && m <= 59;
    },
    { message: 'Nieprawidłowa godzina (zakres 00:00-23:59)' }
  );

// ═══════════════════════════════════════════════════════════════
// TRENINGI
// ═══════════════════════════════════════════════════════════════

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
    is_home: z
      .union([z.string(), z.boolean(), z.undefined()])
      .transform((v) => v === 'true' || v === true)
      .default(true),
    data_do: z
      .union([isoDate, z.literal(''), z.undefined()])
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
  })
  .refine(
    (d) => {
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
  is_home: z
    .union([z.string(), z.boolean(), z.undefined()])
    .transform((v) => v === 'true' || v === true)
    .default(true),
});

export type AktualizujTreningInput = z.infer<typeof aktualizujTreningSchema>;

// ═══════════════════════════════════════════════════════════════
// ZAWODNICY
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// DRUŻYNY
// ═══════════════════════════════════════════════════════════════

export const KOLORY_DRUZYNY = [
  'green', 'blue', 'purple', 'orange', 'red', 'yellow', 'pink', 'slate',
] as const;

export const dodajDruzynaSchema = z.object({
  nazwa: z.string().trim().min(2, 'Nazwa musi mieć min. 2 znaki').max(80),
  rocznik: optionalNumber(1900, 2100),
  kolor: z.enum(KOLORY_DRUZYNY).default('green'),
});

export type DodajDruzynaInput = z.infer<typeof dodajDruzynaSchema>;

// ═══════════════════════════════════════════════════════════════
// HELPER do parsowania FormData
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

export const authEmailSchema = z
  .string()
  .trim()
  .min(1, 'Wpisz swój adres e-mail')
  .email('Adres e-mail jest nieprawidłowy');

export const authPasswordSchema = z
  .string()
  .min(1, 'Wpisz hasło')
  .min(8, 'Hasło musi mieć minimum 8 znaków')
  .max(72, 'Hasło może mieć maksymalnie 72 znaki');

export const loginSchema = z.object({
  email: authEmailSchema,
  password: z.string().min(1, 'Wpisz swoje hasło'),
});

export const signUpSchema = z
  .object({
    email: authEmailSchema,
    password: authPasswordSchema,
    repeatPassword: z.string().min(1, 'Powtórz hasło'),
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: 'Musisz zaakceptować Regulamin i Politykę prywatności',
    }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Hasła nie są identyczne',
    path: ['repeatPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: authEmailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: authPasswordSchema,
    repeatPassword: z.string().min(1, 'Powtórz hasło'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Hasła nie są identyczne',
    path: ['repeatPassword'],
  });

export function zodToFieldErrors(
  error: z.ZodError
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════
// POMOC / ZGŁOSZENIA
// ═══════════════════════════════════════════════════════════════

export const TYPY_ZGLOSZENIA = ['blad', 'pomysl', 'pytanie', 'inne'] as const;

export const zgloszenieSchema = z.object({
  typ: z.enum(TYPY_ZGLOSZENIA),
  email: authEmailSchema,
  temat: z.string().trim().min(3, 'Temat musi mieć min. 3 znaki').max(100),
  opis: z.string().trim().min(10, 'Opis musi mieć min. 10 znaków').max(2000),
  page_url: z.string().trim().max(500).optional().default(''),
  user_agent: z.string().trim().max(500).optional().default(''),
});