// app/(app)/kalendarz/types.ts
export type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
};

export type StatsMap = Record<
  number,
  { obecni: number; nieobecni: number; total: number }
>;