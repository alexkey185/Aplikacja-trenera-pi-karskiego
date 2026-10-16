// lib/treningi.ts
import type { LucideIcon } from 'lucide-react';
import { Calendar, Flame, Target, Trophy } from 'lucide-react';

export type TypTreningu = 'trening' | 'mecz' | 'sparing' | 'turniej';

export const TYPY_TRENINGU: readonly TypTreningu[] = [
  'trening', 'mecz', 'sparing', 'turniej',
] as const;

export type StatusObecnosci =
  | 'obecny'
  | 'nieobecny'
  | 'spozniony'
  | 'usprawiedliwiony';

export const STATUSY_OBECNOSCI: readonly StatusObecnosci[] = [
  'obecny', 'nieobecny', 'spozniony', 'usprawiedliwiony',
] as const;

export type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
  cykl_id?: string | null;
};

export type TreningZObecnoscia = Trening & {
  obecnosc: { trening_id: number; status: string }[] | null;
};

export type StatsObecnosci = {
  obecni: number;
  nieobecni: number;
  total: number;
};

type TypConfig = {
  label: string;
  color: string;
  bg: string;
  border: string;
  borderL: string;
  gradient: string;
  icon: LucideIcon;
};

export const TYP_CONFIG: Record<TypTreningu, TypConfig> = {
  trening: {
    label: 'Trening',
    color: 'bg-blue-500',
    bg: 'bg-blue-500/15',
    border: 'border-blue-400/40',
    borderL: 'border-l-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    icon: Calendar,
  },
  mecz: {
    label: 'Mecz',
    color: 'bg-red-500',
    bg: 'bg-red-500/15',
    border: 'border-red-400/40',
    borderL: 'border-l-red-500',
    gradient: 'from-red-400 to-red-600',
    icon: Trophy,
  },
  sparing: {
    label: 'Sparing',
    color: 'bg-orange-500',
    bg: 'bg-orange-500/15',
    border: 'border-orange-400/40',
    borderL: 'border-l-orange-500',
    gradient: 'from-orange-400 to-orange-600',
    icon: Flame,
  },
  turniej: {
    label: 'Turniej',
    color: 'bg-purple-500',
    bg: 'bg-purple-500/15',
    border: 'border-purple-400/40',
    borderL: 'border-l-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    icon: Target,
  },
};

export const DEFAULT_TYP_CONFIG = TYP_CONFIG.trening;

export function getTypConfig(typ: string): TypConfig {
  return TYP_CONFIG[typ as TypTreningu] ?? DEFAULT_TYP_CONFIG;
}

export const typBorderL = (typ: string) => getTypConfig(typ).borderL;
export const typKolor = (typ: string) => getTypConfig(typ).color;

export function czyObecny(status: string): boolean {
  return status === 'obecny' || status === 'spozniony';
}

export function policzStats(
  obecnosc: { status: string }[] | null | undefined,
): StatsObecnosci {
  let obecni = 0;
  let nieobecni = 0;
  for (const o of obecnosc ?? []) {
    if (czyObecny(o.status)) obecni++;
    else nieobecni++;
  }
  return { obecni, nieobecni, total: obecni + nieobecni };
}

export function zbudujStatsMap(
  treningi: TreningZObecnoscia[],
): Map<number, StatsObecnosci> {
  const map = new Map<number, StatsObecnosci>();
  for (const t of treningi) {
    map.set(t.id, policzStats(t.obecnosc));
  }
  return map;
}

export function kolorFrekwencji(s: StatsObecnosci | undefined): string {
  if (!s || s.total === 0) return 'text-white/50';
  if (s.obecni === s.total) return 'text-green-400';
  if (s.obecni / s.total >= 0.7) return 'text-yellow-400';
  return 'text-red-400';
}

export function odczyscObecnosc(t: TreningZObecnoscia): Trening {
  const { obecnosc: _omit, ...rest } = t;
  return rest;
}
