import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/UserAvatar';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Trophy,
  AlertTriangle,
  Users,
  Activity,
  Award,
} from 'lucide-react';

export default async function Statystyki() {
  noStore();
  const supabase = await createClient();

  const { data: zawodnicy } = await supabase
    .from('zawodnicy')
    .select('*')
    .order('nazwisko', { ascending: true });

  const { data: treningi } = await supabase.from('treningi').select('*');

  const { data: obecnosci } = await supabase
    .from('obecnosc')
    .select('trening_id, zawodnik_id, status');

  const totalTreningi = treningi?.length ?? 0;
  const totalZawodnikow = zawodnicy?.length ?? 0;

  const ranking = (zawodnicy ?? []).map((z) => {
    const wpisy = (obecnosci ?? []).filter((o) => o.zawodnik_id === z.id);
    const obecnosci_count = wpisy.filter(
      (w) => w.status === 'obecny' || w.status === 'spozniony'
    ).length;
    const nieobecnosci = wpisy.filter(
      (w) => w.status === 'nieobecny' || w.status === 'usprawiedliwiony'
    ).length;
    const procent =
      wpisy.length > 0 ? Math.round((obecnosci_count / wpisy.length) * 100) : 0;
    return {
      id: z.id,
      imie: z.imie,
      nazwisko: z.nazwisko,
      numer: z.numer,
      pozycja: z.pozycja,
      procent,
      obecnosci_count,
      nieobecnosci,
      total: wpisy.length,
    };
  });

  const rankingSort = [...ranking]
    .filter((r) => r.total > 0)
    .sort((a, b) => b.procent - a.procent);

  const top5 = rankingSort.slice(0, 5);
  const najgorsi = [...rankingSort].reverse().slice(0, 5);

  const srednia =
    rankingSort.length > 0
      ? Math.round(
          rankingSort.reduce((sum, r) => sum + r.procent, 0) / rankingSort.length
        )
      : 0;

  const totalObecnosci = (obecnosci ?? []).filter(
    (w) => w.status === 'obecny' || w.status === 'spozniony'
  ).length;

  const totalNieobecnosci = (obecnosci ?? []).filter(
    (w) => w.status === 'nieobecny' || w.status === 'usprawiedliwiony'
  ).length;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.png"
          alt=""
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src="/talent-bg.png"
          alt=""
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6 flex items-center gap-3 animate-fadeIn">
            <Link
  href="/dashboard"
  className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0"
>
  <ArrowLeft className="w-5 h-5" />
</Link>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">
                  Statystyki
                </h1>
                <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
                  Frekwencja drużyny
                </p>
              </div>
            </div>
            <UserAvatar />
          </header>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <BigStat
              icon={Activity}
              color="text-green-400"
              bg="from-green-500/20 to-green-700/10"
              border="border-green-400/30"
              label="Średnia frekwencja"
              value={`${srednia}%`}
            />
            <BigStat
              icon={Users}
              color="text-blue-400"
              bg="from-blue-500/20 to-blue-700/10"
              border="border-blue-400/30"
              label="Zawodników"
              value={`${totalZawodnikow}`}
            />
            <BigStat
              icon={TrendingUp}
              color="text-green-400"
              bg="from-green-500/20 to-green-700/10"
              border="border-green-400/30"
              label="Obecności"
              value={`${totalObecnosci}`}
            />
            <BigStat
              icon={AlertTriangle}
              color="text-red-400"
              bg="from-red-500/20 to-red-700/10"
              border="border-red-400/30"
              label="Nieobecności"
              value={`${totalNieobecnosci}`}
            />
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-4 animate-fadeIn flex items-center gap-3 shadow-xl shadow-black/40">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white/60" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white/70">Wszystkich treningów</div>
              <div className="font-bold text-xl text-white">{totalTreningi}</div>
            </div>
          </div>

          {top5.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-4 animate-fadeIn shadow-xl shadow-black/40">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
                  TOP 5 frekwencji
                </h3>
              </div>
              <ul className="space-y-2">
                {top5.map((r, i) => (
                  <RankRow key={r.id} r={r} pozycja={i + 1} kolor="green" />
                ))}
              </ul>
            </div>
          )}

          {najgorsi.length > 0 && najgorsi[0].procent < 70 && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-4 animate-fadeIn shadow-xl shadow-black/40">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
                  Do poprawy
                </h3>
              </div>
              <ul className="space-y-2">
                {najgorsi.map((r, i) => (
                  <RankRow key={r.id} r={r} pozycja={i + 1} kolor="red" />
                ))}
              </ul>
            </div>
          )}

          {rankingSort.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 animate-fadeIn shadow-xl shadow-black/40">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
                  Pełny ranking
                </h3>
              </div>
              <ul className="space-y-1">
                {rankingSort.map((r, i) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/70 flex-shrink-0">
                      {i + 1}
                    </div>
                    <Link href={`/zawodnicy/${r.id}`} className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-white drop-shadow">
                        {r.imie} {r.nazwisko}
                      </div>
                      <div className="text-xs text-white/50">
                        {r.obecnosci_count} / {r.total} treningów
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-20 h-1.5 bg-slate-900/70 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            r.procent >= 80
                              ? 'bg-green-500'
                              : r.procent >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${r.procent}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-bold w-10 text-right ${
                          r.procent >= 80
                            ? 'text-green-400'
                            : r.procent >= 60
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {r.procent}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rankingSort.length === 0 && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center animate-fadeIn shadow-xl shadow-black/40">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white/50" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white drop-shadow">
                Brak danych
              </h3>
              <p className="text-sm text-white/70">
                Zapisz obecność na treningu, żeby zobaczyć statystyki.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function BigStat({
  icon: Icon,
  color,
  bg,
  border,
  label,
  value,
}: {
  icon: any;
  color: string;
  bg: string;
  border: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 bg-gradient-to-br ${bg} border ${border} animate-fadeIn shadow-lg shadow-black/30`}
    >
      <Icon className={`w-5 h-5 ${color} mb-2`} strokeWidth={2.5} />
      <div className="text-2xl font-bold text-white drop-shadow">{value}</div>
      <div className="text-xs text-white/70 mt-0.5">{label}</div>
    </div>
  );
}

function RankRow({
  r,
  pozycja,
  kolor,
}: {
  r: any;
  pozycja: number;
  kolor: 'green' | 'red';
}) {
  const medal =
    kolor === 'green' && pozycja === 1
      ? '🥇'
      : kolor === 'green' && pozycja === 2
      ? '🥈'
      : kolor === 'green' && pozycja === 3
      ? '🥉'
      : `${pozycja}`;

  return (
    <li className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          kolor === 'green'
            ? 'bg-yellow-500/20 border border-yellow-400/40'
            : 'bg-red-500/20 border border-red-400/40'
        }`}
      >
        {medal}
      </div>
      <Link href={`/zawodnicy/${r.id}`} className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-white drop-shadow">
          {r.imie} {r.nazwisko}
        </div>
        <div className="text-xs text-white/50">
          {r.obecnosci_count} / {r.total}
        </div>
      </Link>
      <span
        className={`text-base font-bold flex-shrink-0 ${
          kolor === 'green' ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {r.procent}%
      </span>
    </li>
  );
}