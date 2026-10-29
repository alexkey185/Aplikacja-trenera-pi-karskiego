// app/(app)/kalendarz/constants.ts
export const MONTHS_PL = [
  'Styczen', 'Luty', 'Marzec', 'Kwiecien', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpien', 'Wrzesien', 'Pazdziernik', 'Listopad', 'Grudzien',
];

export const MONTHS_PL_GENITIVE = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'wrzesnia', 'pazdziernika', 'listopada', 'grudnia',
];

export const DAYS_SHORT = ['Pn', 'Wt', 'Sr', 'Cz', 'Pt', 'Sb', 'Nd'];

export const DAYS_LONG = [
  'Niedziela', 'Poniedzialek', 'Wtorek', 'Sroda',
  'Czwartek', 'Piatek', 'Sobota',
];


export type TypConfigEntry = {
  color: string;
  bg: string;
  border: string;
  gradient: string;
  icon: string;
  label: string;
};

export const TYP_CONFIG: Record<string, TypConfigEntry> = {
  trening: {
    color: 'bg-blue-500',
    bg: 'bg-blue-500/15',
    border: 'border-blue-400/40',
    gradient: 'from-blue-400 to-blue-600',
    icon: 'T',
    label: 'Trening',
  },
  mecz: {
    color: 'bg-red-500',
    bg: 'bg-red-500/15',
    border: 'border-red-400/40',
    gradient: 'from-red-400 to-red-600',
    icon: 'M',
    label: 'Mecz',
  },
  sparing: {
    color: 'bg-orange-500',
    bg: 'bg-orange-500/15',
    border: 'border-orange-400/40',
    gradient: 'from-orange-400 to-orange-600',
    icon: 'S',
    label: 'Sparing',
  },
  turniej: {
    color: 'bg-purple-500',
    bg: 'bg-purple-500/15',
    border: 'border-purple-400/40',
    gradient: 'from-purple-400 to-purple-600',
    icon: 'T',
    label: 'Turniej',
  },
};