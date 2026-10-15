import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { DeleteButton } from './edytuj/DeleteButton';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Pencil,
  Phone,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Activity,
  ChevronDown,
  Clock,
  FileCheck2,
} from 'lucide-react';

type TreningRow = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
};

type WpisZTreningiem = {
  status: string;
  trening_id: number;
  trening: TreningRow;
};

export default async function KartaZawodnika({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const { data: zawodnik, error: errZ } = await supabase
    .from('zawodnicy')
    .select('id, imie, nazwisko, rocznik, pozycja, numer, kontakt_rodzica, notatki')
    .eq('id', idNum)
    .eq('druzyna_id', druzynaId)
    .single();
  if (errZ || !zawodnik) notFound();

  const { data: wpisy } = await supabase
    .from('obecnosc')
    .select('status, trening_id')
    .eq('zawodnik_id', idNum);

  const treningIds = Array.from(new Set((wpisy ?? []).map((w) => w.trening_id)));

  const { data: treningi } =
    treningIds.length > 0
      ? await supabase
          .from('treningi')
          .select('id, data, godzina, typ, przeciwnik')
          .in('id', treningIds)
          .eq('druzyna_id', druzynaId)
      : { data: [] as TreningRow[] };

  const treningMap = new Map<number, TreningRow>();
  (treningi ?? []).forEach((t) => treningMap.set(t.id, t));

  const stats = { obecny: 0, nieobecny: 0, spozniony: 0, usprawiedliwiony: 0, total: 0 };
  (wpisy ?? []).forEach((w) => {
    stats.total += 1;
    if (w.status === 'obecny') stats.obecny += 1;
    else if (w.status === 'spozniony') stats.spozniony += 1;
    else if (w.status === 'usprawiedliwiony') stats.usprawiedliwiony += 1;
    else stats.nieobecny += 1;
  });

  const obecniRazem = stats.obecny + stats.spozniony;
  const procent = stats.total > 0 ? Math.round((obecniRazem / stats.total) * 100) : 0;

  // ═══════════════════════════════════════════════════════════════
  // Kluczowa zmiana: użycie type predicate żeby zawęzić typ
  // i wyeliminować „w.trening possibly undefined" w dalszych
  // .map / .sort.
  // ═══════════════════════════════════════════════════════════════
  const wpisyZGrupowane: WpisZTreningiem[] = (wpisy ?? [])
    .map((w) => {
      const trening = treningMap.get(w.trening_id);
      if (!trening) return null;
      return { status: w.status, trening_id: w.trening_id, trening };
    })
    .filter((w): w is WpisZTreningiem => w !== null)
    .sort((a, b) => (a.trening.data < b.trening.data ? 1 : -1));

  type GrupaMiesiac = {
    iso: string;
    label: string;
    rok: number;
    miesiac: number;
    wpisy: WpisZTreningiem[];
    obecni: number;
    total: number;
  };

  const grupyMap = new Map<string, GrupaMiesiac>();
  wpisyZGrupowane.forEach((w) => {
    const isoMies = w.trening.data.slice(0, 7);
    if (!grupyMap.has(isoMies)) {
      const [rr, mm] = isoMies.split('-').map(Number);
      const d = new Date(rr, mm - 1, 1);
      const nazwa = d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
      grupyMap.set(isoMies, {
        iso: isoMies,
        label: nazwa.charAt(0).toUpperCase() + nazwa.slice(1),
        rok: rr,
        miesiac: mm,
        wpisy: [],
        obecni: 0,
        total: 0,
      });
    }
    const g = grupyMap.get(isoMies)!;
    g.wpisy.push(w);
    g.total += 1;
    if (w.status === 'obecny' || w.status === 'spozniony') g.obecni += 1;
  });

  const grupy = Array.from(grupyMap.values());

  const statusInfo = (s: string) => {
    if (s === 'obecny')
      return {
        icon: CheckCircle2,
        color: 'text-green-400',
        label: 'Obecny',
        bg: 'from-green-400 to-green-600',
      };
    if (s === 'spozniony')
      return {
        icon: Clock,
        color: 'text-yellow-400',
        label: 'Spóźniony',
        bg: 'from-yellow-400 to-yellow-600',
      };
    if (s === 'usprawiedliwiony')
      return {
        icon: FileCheck2,
        color: 'text-orange-400',
        label: 'Usprawiedliwiony',
        bg: 'from-orange-400 to-orange-600',
      };
    return {
      icon: XCircle,
      color: 'text-red-400',
      label: 'Nieobecny',
      bg: 'from-red-400 to-red-600',
    };
  };

  const kolorMiesiaca = (proc: number) => {
    if (proc >= 80)
      return { bg: 'bg-green-500/15', border: 'border-green-400/40', text: 'text-green-400' };
    if (proc >= 60)
      return { bg: 'bg-amber-500/15', border: 'border-amber-400/40', text: 'text-amber-400' };
    return { bg: 'bg-red-500/15', border: 'border-red-400/40', text: 'text-red-400' };
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <Link
          href="/kadra"
          className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-semibold text-white/70 drop-shadow">Karta zawodnika</h1>
      </header>

      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4 animate-fadeIn relative overflow-hidden shadow-2xl shadow-black/60">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center font-bold text-3xl shadow-2xl text-white">
              {zawodnik.numer ?? '—'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate text-white drop-shadow-lg">
              {zawodnik.imie} {zawodnik.nazwisko}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {zawodnik.pozycja && (
                <span className="inline-flex items-center gap-1 bg-green-500/20 border border-green-400/40 rounded-full px-2.5 py-1 text-xs font-medium text-green-200">
                  <Target className="w-3 h-3" /> {zawodnik.pozycja}
                </span>
              )}
              {zawodnik.rocznik && (
                <span className="inline-flex items-center gap-1 bg-yellow-500/20 border border-yellow-400/40 rounded-full px-2.5 py-1 text-xs font-medium text-yellow-200">
                  <Trophy className="w-3 h-3" /> {zawodnik.rocznik}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/zawodnicy/${idNum}/edytuj`}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
              title="Edytuj zawodnika"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <DeleteButton id={idNum} compact />
          </div>
        </div>
        {zawodnik.kontakt_rodzica && (
          <div className="relative mt-4 flex items-center gap-2 text-sm text-white/90 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
            <Phone className="w-4 h-4 text-green-400" />
            <span className="font-medium">{zawodnik.kontakt_rodzica}</span>
            <span className="text-xs text-white/50 ml-auto">Rodzic</span>
          </div>
        )}
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-3.5 h-3.5 text-green-400" />
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Frekwencja</h3>
        </div>
        <div className="flex items-center gap-5">
          <ProgressRing procent={procent} />
          <div className="flex-1 min-w-0">
            <div className="text-4xl font-bold text-white drop-shadow">{procent}%</div>
            <div className="text-sm text-white/70 mt-1">
              {obecniRazem} z {stats.total} treningów
            </div>
            <div className="text-xs text-white/60 mt-1">
              {procent >= 80
                ? '🌟 Świetna frekwencja'
                : procent >= 60
                ? '👍 Dobra frekwencja'
                : '⚠️ Warto poprawić'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-5">
          <StatBox
            icon={CheckCircle2}
            color="text-green-400"
            bg="bg-green-500/15 border-green-400/30"
            label="Obecny"
            value={stats.obecny}
          />
          <StatBox
            icon={Clock}
            color="text-yellow-400"
            bg="bg-yellow-500/15 border-yellow-400/30"
            label="Spóźniony"
            value={stats.spozniony}
          />
          <StatBox
            icon={XCircle}
            color="text-red-400"
            bg="bg-red-500/15 border-red-400/30"
            label="Nieobecny"
            value={stats.nieobecny}
          />
          <StatBox
            icon={FileCheck2}
            color="text-orange-400"
            bg="bg-orange-500/15 border-orange-400/30"
            label="Usprawiedliwiony"
            value={stats.usprawiedliwiony}
          />
        </div>
      </div>

      {grupy.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 animate-fadeIn shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Historia treningów
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-white/40">
              {stats.total} {stats.total === 1 ? 'wpis' : 'wpisów'} · {grupy.length}{' '}
              {grupy.length === 1 ? 'miesiąc' : 'miesięcy'}
            </span>
          </div>

          <div className="space-y-2">
            {grupy.map((g, idx) => {
              const proc = g.total > 0 ? Math.round((g.obecni / g.total) * 100) : 0;
              const kol = kolorMiesiaca(proc);
              return (
                <details
                  key={g.iso}
                  open={idx === 0}
                  className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]"
                >
                  <summary className="flex items-center justify-between gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl ${kol.bg} border ${kol.border} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className={`text-sm font-black ${kol.text}`}>
                          {String(g.miesiac).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white capitalize truncate">
                          {g.label}
                        </div>
                        <div className="text-[10px] text-white/50">
                          {g.total} {g.total === 1 ? 'trening' : 'treningów'} ·{' '}
                          <span className={`font-semibold ${kol.text}`}>{proc}%</span> frekwencji
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>

                  <div className="px-3 pb-2 pt-1 space-y-1 border-t border-white/5">
                    {g.wpisy.map((w, i) => {
                      const info = statusInfo(w.status);
                      const Icon = info.icon;
                      return (
                        <div
                          key={`${w.trening_id}-${w.status}-${i}`}
                          className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div
                            className={`relative w-8 h-8 rounded-lg bg-gradient-to-br ${info.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}
                          >
                            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate capitalize">
                              {w.trening.typ}
                              {w.trening.przeciwnik && (
                                <span className="text-white/60 font-normal">
                                  {' '}
                                  vs {w.trening.przeciwnik}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-white/50 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(w.trening.data).toLocaleDateString('pl-PL', {
                                weekday: 'short',
                                day: '2-digit',
                                month: '2-digit',
                              })}
                              {w.trening.godzina && ` · ${w.trening.godzina}`}
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold ${info.color}`}>
                            {info.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      {zawodnik.notatki && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mt-4 animate-fadeIn shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-3.5 h-3.5 text-green-400" />
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
              Notatki trenera
            </h3>
          </div>
          <div className="text-sm whitespace-pre-wrap text-white/90 leading-relaxed">
            {zawodnik.notatki}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ procent }: { procent: number }) {
  const size = 96;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (procent / 100) * circumference;
  const color = procent >= 80 ? '#22c55e' : procent >= 60 ? '#eab308' : '#ef4444';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white/60" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  color,
  bg,
  label,
  value,
}: {
  icon: typeof Trophy;
  color: string;
  bg: string;
  label: string;
  value: number;
}) {
  return (
    <div className={`flex items-center gap-3 ${bg} border rounded-xl px-3 py-2.5`}>
      <Icon className={`w-4 h-4 ${color} flex-shrink-0`} strokeWidth={2.5} />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/60 truncate">{label}</div>
        <div className="font-bold text-white text-lg leading-tight">{value}</div>
      </div>
    </div>
  );
}