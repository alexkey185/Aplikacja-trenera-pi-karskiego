export type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
  is_home?: boolean | null;
  wynik_gospodarzy?: number | null;
  wynik_gosci?: number | null;
};

export type StatsMap = Record<
  number,
  { obecni: number; nieobecni: number; total: number }
>;