import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowLeft,
  Plus,
  Calendar as CalendarIcon,
  Trophy,
  Flame,
  Target,
  Clock,
  MapPin,
  ChevronRight,
  Users,
  Sparkles,
} from 'lucide-react';

export default async function Kalendarz() {
  noStore();
  const supabase = await createClient();

  const { data: treningi, error } = await supabase
    .from('treningi')
    .select('*')
    .order('data', { ascending: true });

  const { data: obecnosci } = await supabase
    .from('obecnosc')
    .select('trening_id, status');

  const stats = new Map<number, { obecni: number; total: number }>();
  (obecnosci ?? []).forEach((o) => {
    const s = stats.get(o.trening_id) ?? { obecni: 0, total: 0 };
    s.total += 1;
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    stats.set(o.trening_id, s);
  });

  const dzis = new Date().toISOString().split('T')[0];
  const nadchodzace = (treningi ?? []).filter((t) => t.data >= dzis);
  const minione = (treningi ?? []).filter((t) => t.data < dzis).reverse();

  const typInfo = (typ: string) => {
    if (typ === 'mecz') return { icon: Trophy, bg: 'from-red-400 to-red-600' };
    if (typ === 'sparing') return { icon: Flame, bg: 'from-orange-400 to-orange-600' };
    if (typ === 'turniej') return { icon: Target, bg: 'from-purple-400 to-purple-600' };
    return { icon: CalendarIcon, bg: 'from-blue-400 to-blue-600' };
  };

  const Karta = ({ t, index }: { t: any; index: number }) => {
    const info = typInfo(t.typ);
    const Icon = info.icon;
    const s = stats.get(t.id);

    const frekwencjaKolor =
      s && s.total > 0
        ? s.obecni === s.total
          ? 'text-green-400'
          : s.obecni / s.total >= 0.7
          ? 'text-yellow-400'
          : 'text-red-400'
        : 'text-white/50';

    return (
      <li
        className={`group bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-slate-900 hover:border-white/30 transition-all hover:-translate-y-0.5 shadow-xl shadow-black/40 animate-fadeIn stagger-${Math.min(
          index + 1,
          8
        )}`}
      >
        <Link href={`/kalendarz/${t.id}/obecnosc`} className="flex items-center gap-4 p-4">
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${info.bg} rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity`} />
            <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${info.bg} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white flex items-center gap-2 drop-shadow">
              <span>
                {new Date(t.data).toLocaleDateString('pl-PL', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
              <span className="text-white/30">·</span>
              <span className="text-white/70 font-medium">{t.godzina}</span>
            </div>

            <div className="text-sm text-white/70 flex items-center gap-1.5 mt-0.5">
              <span className="capitalize">{t.typ}</span>
              {t.przeciwnik && (
                <>
                  <span className="text-white/30">•</span>
                  <span>vs {t.przeciwnik}</span>
                </>
              )}
              {t.miejsce && (
                <>
                  <span className="text-white/30">•</span>
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{t.miejsce}</span>
                </>
              )}
            </div>

            {s && s.total > 0 && (
              <div className="text-xs mt-1 flex items-center gap-1.5">
                <Users className={`w-3 h-3 ${frekwencjaKolor}`} />
                <span className={`font-medium ${frekwencjaKolor}`}>
                  {s.obecni}/{s.total} obecnych
                </span>
              </div>
            )}
          </div>

          <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>
      </li>
    );
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* TŁO MOBILE */}
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

      {/* TŁO DESKTOP */}
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

      {/* Przygaszenie - jak w dashboard */}
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      {/* TREŚĆ */}
      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
  Plan
</h1>
                  <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
                    {nadchodzace.length} nadchodzących · {minione.length} minionych
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/kalendarz/nowy"
              className="group flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-4 py-3 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5 w-full"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Dodaj wydarzenie
            </Link>
          </header>

          {error && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-2xl p-4 mb-4 text-sm animate-fadeIn text-red-200">
              Błąd: {error.message}
            </div>
          )}

          {(!treningi || treningi.length === 0) && <EmptyState />}

          {nadchodzace.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 animate-fadeIn">
                <Sparkles className="w-3.5 h-3.5 text-green-400" />
                <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest drop-shadow">
                  Nadchodzące
                </h2>
              </div>
              <ul className="space-y-2">
                {nadchodzace.map((t, i) => (
                  <Karta key={t.id} t={t} index={i} />
                ))}
              </ul>
            </div>
          )}

          {minione.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 animate-fadeIn">
                <Clock className="w-3.5 h-3.5 text-white/50" />
                <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest drop-shadow">
                  Minione
                </h2>
              </div>
              <ul className="space-y-2 opacity-70">
                {minione.map((t, i) => (
                  <Karta key={t.id} t={t} index={i} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center animate-fadeIn relative overflow-hidden shadow-xl shadow-black/40">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <CalendarIcon className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-bold text-xl mb-2 text-white drop-shadow">Pusty kalendarz</h3>
        <p className="text-sm text-white/70 mb-6 max-w-xs mx-auto">
          Dodaj pierwszy trening albo mecz, żeby planować tydzień drużyny.
        </p>
        <Link
          href="/kalendarz/nowy"
          className="group inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Dodaj pierwsze wydarzenie
        </Link>
      </div>
    </div>
  );
}