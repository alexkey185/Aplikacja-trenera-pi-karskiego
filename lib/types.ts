// lib/types.ts - Single source of truth dla typow aplikacji (ARCH-03)

export type Obecnosc = {
  trening_id: number;
  zawodnik_id: number;
  status: 'obecny' | 'nieobecny' | 'spozniony' | 'usprawiedliwiony';
};

export type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: 'trening' | 'mecz' | 'sparing' | 'turniej';
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id: string | null;
  druzyna_id: string;
};

export type TreningZObecnoscia = Trening & {
  obecnosc: Obecnosc[] | null;
};

export type StatsMap = Record<
  number,
  { obecni: number; nieobecni: number; total: number }
>;

export type Druzyna = {
  id: string;
  nazwa: string;
  rocznik: number | null;
  kolor: string;
  logo_url: string | null;
  user_id: string;
  rola: 'admin' | 'trener';
};

export type Zawodnik = {
  id: number;
  imie: string;
  nazwisko: string;
  rocznik: number | null;
  pozycja: string | null;
  numer: number | null;
  kontakt_rodzica: string | null;
  notatki: string | null;
  druzyna_id: string;
  has_consent: boolean;
};

export type Consent = {
  id: number;
  zawodnik_id: number;
  druzyna_id: string;
  consent_type: 'rodzic' | 'opiekun';
  consent_holder_name: string | null;
  consent_holder_email: string | null;
  consent_holder_phone: string | null;
  consent_given_at: string;
  consent_method: 'paper' | 'electronic' | 'verbal';
  consent_notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};
