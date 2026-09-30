import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { TopBar } from '@/components/TopBar';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Trophy,
  AlertTriangle,
  Users,
  Activity,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default async function Statystyki() {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const { data: zawodnicy } = await supabase
    .from('zawodnicy')
    .select('id, imie, nazwisko, numer, pozycja')
    .eq('druzyna_id', druzynaId)
    .order('nazwisko', { ascending: true });

  const { data: treningi } = await supabase
    .from('treningi')
    .select('id, data, typ')
    .eq('druzyna_id', druzynaId);

  const treningiIds = (treningi ?? []).map((t) => t.id);

  const { data: obecnosci } =
    treningiIds.length > 0
      ? await supabase
          .from('obecnosc')
          .select('trening_id, zawodnik_id, status')
          .in('trening_id', treningiIds)
      : { data: [] };

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

  const teraz = new Date();
  const miesiace: { label: string; procent: number; count: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(teraz.getFullYear(), teraz.getMonth() - i, 1);
    const rokMiesiac = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const treningiMies = (treningi ?? []).filter((t) =>
      t.data.startsWith(rokMiesiac)
    );
    const idsMies = treningiMies.map((t) => t.id);
    const obecnosciMies = (obecnosci ?? []).filter((o) =>
      idsMies.includes(o.trening_id)
    );
    const obecniMies = obecnosciMies.filter(
      (o) => o.status === 'obecny' || o.status === 'spozniony'
    ).length;
    const procentMies =
      obecnosciMies.length > 0
        ? Math.round((obecniMies / obecnosciMies.length) * 100)
        : 0;

    const nazwaKrotka = d.toLocaleDateString('pl-PL', { month: 'short' });
    miesiace.push({
      label: nazwaKrotka.charAt(0).toUpperCase() + nazwaKrotka.slice(1, 3),
      procent: procentMies,
      count: treningiMies.length,
    });
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image src="/talent-bg-mobile.webp" alt="" fill quality={60} sizes="100vw" className="object-cover object-center" aria-hidden />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image src="/talent-bg.webp" alt="" fill quality={60} sizes="100vw" className="object-cover object-center" aria-hidden />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 lg:p-8 pb-28">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 flex items-center gap-3 animate-fadeIn">
            <Link href="/kadra" className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0">
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
                <h1 className="text-xl md:text-2xl font-bold leading-tight text-white drop-shadow-lg">Statystyki</h1>
                <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">Frekwencja drużyny</p>
              </div>
            </div>
            <TopBar />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 animate-fadeIn shadow-2xl shadow-black/60">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Frekwencja — ostatnie 6 miesięcy</h3>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[100, 75, 50, 25, 0].map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <span className="text-[9px] text-white/30 w-6 text-right">{v}%</span>
                        <div className="flex-1 border-t border-dashed border-white/5" />
                      </div>
                    ))}
                  </div>
                  <div className="relative h-52 pl-10 flex items-end gap-3 pb-6">
                    {miesiace.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="w-full relative rounded-t-xl bg-gradient-to-t from-green-700 to-green-400 shadow-lg shadow-green-500/30 group-hover:shadow-green-400/60 transition-all animate-fadeIn" style={{ height: `${m.procent}%`, minHeight: m.procent > 0 ? '8px' : '2px', animationDelay: `${i * 100}ms` }}>
                          {m.procent > 0 && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap">{m.procent}%</div>
                          )}
                        </div>
                        <div className="absolute bottom-0 text-[10px] text-white/50 font-semibold uppercase">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                  <span>Średnia z 6 miesięcy</span>
                  <span className="text-white font-bold">
                    {miesiace.length > 0 ? Math.round(miesiace.reduce((s, m) => s + m.procent, 0) / miesiace.length) : 0}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 animate-fadeIn shadow-2xl shadow-black/60">
                <div className="flex items-center gap-2 mb-5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Rozkład obecności (wszystkie treningi)</h3>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="relative flex-shrink-0">
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      {(() => {
                        const total = totalObecnosci + totalNieobecnosci;
                        if (total === 0) {
                          return <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="20" />;
                        }
                        const r = 55;
                        const circumference = 2 * Math.PI * r;
                        const greenLen = (totalObecnosci / total) * circumference;
                        const redLen = (totalNieobecnosci / total) * circumference;
                        return (
                          <>
                            <circle cx="70" cy="70" r={r} fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray={`${greenLen} ${circumference}`} transform="rotate(-90 70 70)" />
                            <circle cx="70" cy="70" r={r} fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray={`${redLen} ${circumference}`} strokeDashoffset={-greenLen} transform="rotate(-90 70 70)" />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-black text-white leading-none">
                        {totalObecnosci + totalNieobecnosci > 0 ? Math.round((totalObecnosci / (totalObecnosci + totalNieobecnosci)) * 100) : 0}%
                      </div>
                      <div className="text-[9px] text-white/50 uppercase tracking-wider mt-1">Obecnych</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-400/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-white leading-none">{totalObecnosci}</div>
                        <div className="text-xs text-white/60 mt-0.5">Obecny</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-400/30 flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-white leading-none">{totalNieobecnosci}</div>
                        <div className="text-xs text-white/60 mt-0.5">Nieobecny</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <BigStat icon={Activity} color="text-green-400" bg="from-green-500/20 to-green-700/10" border="border-green-400/30" label="Średnia" value={`${srednia}%`} />
                <BigStat icon={Users} color="text-blue-400" bg="from-blue-500/20 to-blue-700/10" border="border-blue-400/30" label="Zawodników" value={`${totalZawodnikow}`} />
                <BigStat icon={TrendingUp} color="text-green-400" bg="from-green-500/20 to-green-700/10" border="border-green-400/30" label="Obecności" value={`${totalObecnosci}`} />
                <BigStat icon={AlertTriangle} color="text-red-400" bg="from-red-500/20 to-red-700/10" border="border-red-400/30" label="Nieobecności" value={`${totalNieobecnosci}`} />
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 animate-fadeIn flex items-center gap-3 shadow-xl shadow-black/40">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-white/60" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60">Wszystkich treningów</div>
                  <div className="font-bold text-xl text-white">{totalTreningi}</div>
                </div>
              </div>

              {top5.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 animate-fadeIn shadow-xl shadow-black/40">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">TOP 5 frekwencji</h3>
                  </div>
                  <ul className="space-y-2">
                    {top5.map((r, i) => (<RankRow key={r.id} r={r} pozycja={i + 1} kolor="green" />))}
                  </ul>
                </div>
              )}

              {najgorsi.length > 0 && najgorsi[0].procent < 70 && (
                <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 animate-fadeIn shadow-xl shadow-black/40">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Do poprawy</h3>
                  </div>
                  <ul className="space-y-2">
                    {najgorsi.slice(0, 3).map((r, i) => (<RankRow key={r.id} r={r} pozycja={i + 1} kolor="red" />))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {rankingSort.length > 0 && (
            <div className="mt-5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 animate-fadeIn shadow-xl shadow-black/40">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Pełny ranking</h3>
              </div>
              <ul className="space-y-1">
                {rankingSort.map((r, i) => (
                  <li key={r.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/70 flex-shrink-0">{i + 1}</div>
                    <Link href={`/zawodnicy/${r.id}`} className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-white drop-shadow">{r.imie} {r.nazwisko}</div>
                      <div className="text-xs text-white/50">{r.obecnosci_count} / {r.total} treningów</div>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-24 h-1.5 bg-slate-900/70 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${r.procent >= 80 ? 'bg-green-500' : r.procent >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${r.procent}%` }} />
                      </div>
                      <span className={`text-sm font-bold w-10 text-right ${r.procent >= 80 ? 'text-green-400' : r.procent >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{r.procent}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rankingSort.length === 0 && (
            <div className="mt-5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center animate-fadeIn shadow-xl shadow-black/40">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white/50" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white drop-shadow">Brak danych</h3>
              <p className="text-sm text-white/70">Zapisz obecność na treningu, żeby zobaczyć statystyki.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function BigStat({ icon: Icon, color, bg, border, label, value }: { icon: any; color: string; bg: string; border: string; label: string; value: string }) {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 bg-gradient-to-br ${bg} border ${border} animate-fadeIn shadow-lg shadow-black/30`}>
      <Icon className={`w-5 h-5 ${color} mb-2`} strokeWidth={2.5} />
      <div className="text-2xl font-bold text-white drop-shadow">{value}</div>
      <div className="text-xs text-white/70 mt-0.5">{label}</div>
    </div>
  );
}

function RankRow({ r, pozycja, kolor }: { r: any; pozycja: number; kolor: 'green' | 'red' }) {
  const medal = kolor === 'green' && pozycja === 1 ? '🥇' : kolor === 'green' && pozycja === 2 ? '🥈' : kolor === 'green' && pozycja === 3 ? '🥉' : `${pozycja}`;
  return (
    <li className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${kolor === 'green' ? 'bg-yellow-500/20 border border-yellow-400/40' : 'bg-red-500/20 border border-red-400/40'}`}>{medal}</div>
      <Link href={`/zawodnicy/${r.id}`} className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-white drop-shadow">{r.imie} {r.nazwisko}</div>
        <div className="text-xs text-white/50">{r.obecnosci_count} / {r.total}</div>
      </Link>
      <span className={`text-base font-bold flex-shrink-0 ${kolor === 'green' ? 'text-green-400' : 'text-red-400'}`}>{r.procent}%</span>
    </li>
  );
}