import Link from 'next/link';
import {
  Users,
  UserPlus,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type Krok = {
  id: string;
  tytul: string;
  opis: string;
  href: string;
  icon: typeof Users;
  done: boolean;
};

export function OnboardingChecklist({
  hasDruzyna,
  hasZawodnicy,
  hasTreningi,
}: {
  hasDruzyna: boolean;
  hasZawodnicy: boolean;
  hasTreningi: boolean;
}) {
  const kroki: Krok[] = [
    {
      id: 'druzyna',
      tytul: 'Utwórz drużynę',
      opis: 'Nazwa, rocznik, kolor drużyny',
      href: '/druzyny/nowa',
      icon: Users,
      done: hasDruzyna,
    },
    {
      id: 'zawodnicy',
      tytul: 'Dodaj zawodników',
      opis: 'Minimum 1 zawodnik, żeby zapisywać obecność',
      href: '/zawodnicy/nowy',
      icon: UserPlus,
      done: hasZawodnicy,
    },
    {
      id: 'trening',
      tytul: 'Zaplanuj pierwszy trening',
      opis: 'Dodaj wydarzenie w kalendarzu',
      href: '/kalendarz/nowy',
      icon: Calendar,
      done: hasTreningi,
    },
  ];

  const zrobione = kroki.filter((k) => k.done).length;
  const wszystkieDone = zrobione === kroki.length;

  // Wszystko zrobione → ukryj
  if (wszystkieDone) return null;

  const procent = Math.round((zrobione / kroki.length) * 100);
  const pierwszyNiezrobiony = kroki.find((k) => !k.done);

  return (
    <div className="mb-5 bg-gradient-to-br from-green-500/10 via-slate-900/80 to-slate-900/80 backdrop-blur-md border border-green-400/30 rounded-3xl p-5 shadow-2xl shadow-black/60 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-md opacity-60" />
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-white text-base drop-shadow">
            Pierwsze kroki w Talencie
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            {zrobione} z {kroki.length} ukończone
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-black text-green-400 leading-none tabular-nums">
            {procent}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
          style={{ width: `${procent}%` }}
        />
      </div>

      {/* Kroki */}
      <div className="space-y-2">
        {kroki.map((krok) => {
          const Icon = krok.icon;
          const isNext = !krok.done && krok.id === pierwszyNiezrobiony?.id;

          if (krok.done) {
            return (
              <div
                key={krok.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <CheckCircle2
                  className="w-5 h-5 text-green-400 flex-shrink-0"
                  strokeWidth={2.5}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white/50 line-through truncate">
                    {krok.tytul}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={krok.id}
              href={krok.href}
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isNext
                  ? 'bg-green-500/10 border-green-400/40 hover:bg-green-500/15 hover:border-green-400/60'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isNext
                    ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-500/30'
                    : 'bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-bold truncate ${
                    isNext ? 'text-white' : 'text-white/80'
                  }`}
                >
                  {krok.tytul}
                </div>
                <div className="text-[11px] text-white/50 truncate mt-0.5">
                  {krok.opis}
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 flex-shrink-0 transition-all group-hover:translate-x-0.5 ${
                  isNext ? 'text-green-400' : 'text-white/30'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}