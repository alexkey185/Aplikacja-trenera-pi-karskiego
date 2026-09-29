import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Pencil, Phone, Calendar, Trophy, Target, TrendingUp, Activity } from 'lucide-react';

export default async function KartaZawodnika({ params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const supabase = await createClient();
  const { data: zawodnik, error: errZ } = await supabase.from('zawodnicy').select('*').eq('id', idNum).single();
  if (errZ || !zawodnik) notFound();

  const { data: wpisy } = await supabase.from('obecnosc').select('status, trening_id').eq('zawodnik_id', idNum);
  const { data: treningi } = await supabase.from('treningi').select('id, data, godzina, typ, przeciwnik');

  const treningMap = new Map<number, any>();
  (treningi ?? []).forEach((t) => treningMap.set(t.id, t));

  const stats = { obecny: 0, nieobecny: 0, total: 0 };
  (wpisy ?? []).forEach((w) => {
    stats.total += 1;
    if (w.status === 'obecny' || w.status === 'spozniony') stats.obecny += 1;
    else stats.nieobecny += 1;
  });

  const procent = stats.total > 0 ? Math.round((stats.obecny / stats.total) * 100) : 0;

  const ostatnie = (wpisy ?? [])
    .map((w) => ({ ...w, trening: treningMap.get(w.trening_id) }))
    .filter((w) => w.trening)
    .sort((a, b) => (a.trening.data < b.trening.data ? 1 : -1))
    .slice(0, 10);

  const statusInfo = (s: string) => {
    const obecny = s === 'obecny' || s === 'spozniony';
    return obecny
      ? { icon: CheckCircle2, color: 'text-green-400', label: 'Obecny', bg: 'from-green-400 to-green-600' }
      : { icon: XCircle, color: 'text-red-400', label: 'Nieobecny', bg: 'from-red-400 to-red-600' };
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image src="/talent-bg-mobile.webp" alt="" fill  quality={75} sizes="100vw" className="object-cover object-center" aria-hidden />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image src="/talent-bg.webp" alt="" fill  quality={75} sizes="100vw" className="object-cover object-center" aria-hidden />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6 flex items-center gap-3 animate-fadeIn">
            <Link href="/kadra" className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold text-white/70 drop-shadow">Karta zawodnika</h1>
          </header>

          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4 animate-fadeIn relative overflow-hidden shadow-2xl shadow-black/60">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center font-bold text-3xl shadow-2xl text-white">{zawodnik.numer ?? '—'}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold truncate text-white drop-shadow-lg">{zawodnik.imie} {zawodnik.nazwisko}</h2>
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
              <Link href={`/zawodnicy/${idNum}/edytuj`} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0">
                <Pencil className="w-4 h-4" />
              </Link>
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
                <div className="text-sm text-white/70 mt-1">{stats.obecny} z {stats.total} treningów</div>
                <div className="text-xs text-white/60 mt-1">
                  {procent >= 80 ? '🌟 Świetna frekwencja' : procent >= 60 ? '👍 Dobra frekwencja' : '⚠️ Warto poprawić'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <StatBox icon={CheckCircle2} color="text-green-400" bg="bg-green-500/15 border-green-400/30" label="Obecny" value={stats.obecny} />
              <StatBox icon={XCircle} color="text-red-400" bg="bg-red-500/15 border-red-400/30" label="Nieobecny" value={stats.nieobecny} />
            </div>
          </div>

          {ostatnie.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 animate-fadeIn shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Ostatnie treningi</h3>
              </div>
              <ul className="space-y-1">
                {ostatnie.map((w, i) => {
                  const info = statusInfo(w.status);
                  const Icon = info.icon;
                  return (
                    <li key={`${w.trening_id}-${w.status}`} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors animate-fadeIn stagger-${Math.min(i + 1, 8)}`}>
                      <div className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${info.bg} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate drop-shadow">
                          <span className="capitalize">{w.trening.typ}</span>
                          {w.trening.przeciwnik && <span className="text-white/60"> vs {w.trening.przeciwnik}</span>}
                        </div>
                        <div className="text-xs text-white/50 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(w.trening.data).toLocaleDateString('pl-PL', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${info.color}`}>{info.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {zawodnik.notatki && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mt-4 animate-fadeIn shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-green-400" />
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Notatki trenera</h3>
              </div>
              <div className="text-sm whitespace-pre-wrap text-white/90 leading-relaxed">{zawodnik.notatki}</div>
            </div>
          )}
        </div>
      </div>
    </main>
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
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white/60" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, color, bg, label, value }: { icon: any; color: string; bg: string; label: string; value: number }) {
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