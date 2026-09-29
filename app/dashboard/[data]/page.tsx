import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  Flame,
  Target,
  Users,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default async function DzienSzczegoly({
  params,
}: {
  params: Promise<{ data: string }>;
}) {
  
  const { data } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    notFound();
  }

  const dataObj = new Date(data + 'T00:00:00');
  if (isNaN(dataObj.getTime())) {
    notFound();
  }

  const supabase = await createClient();

  const { data: treningi } = await supabase
    .from('treningi')
    .select('*')
    .eq('data', data)
    .order('godzina', { ascending: true });

  const treningIds = (treningi ?? []).map((t) => t.id);
  let obecnosci: any[] = [];
  if (treningIds.length > 0) {
    const { data: ob } = await supabase
      .from('obecnosc')
      .select('trening_id, status')
      .in('trening_id', treningIds);
    obecnosci = ob ?? [];
  }

  const stats = new Map<number, { obecni: number; total: number }>();
  obecnosci.forEach((o) => {
    const s = stats.get(o.trening_id) ?? { obecni: 0, total: 0 };
    s.total += 1;
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    stats.set(o.trening_id, s);
  });

  const typInfo = (typ: string) => {
    if (typ === 'mecz') return { icon: Trophy, bg: 'from-red-400 to-red-600', label: 'Mecz' };
    if (typ === 'sparing') return { icon: Flame, bg: 'from-orange-400 to-orange-600', label: 'Sparing' };
    if (typ === 'turniej') return { icon: Target, bg: 'from-purple-400 to-purple-600', label: 'Turniej' };
    return { icon: CalendarIcon, bg: 'from-blue-400 to-blue-600', label: 'Trening' };
  };

  const formatDnia = dataObj.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const dzisStr = new Date().toISOString().split('T')[0];
  const czyDzis = data === dzisStr;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.webp"
          alt=""
          fill
          
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src="/talent-bg.webp"
          alt=""
          fill
          
          quality={75}
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
              className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div
                  className={`absolute inset-0 rounded-2xl blur-lg opacity-60 ${
                    czyDzis
                      ? 'bg-gradient-to-br from-green-400 to-green-700'
                      : 'bg-gradient-to-br from-blue-400 to-blue-700'
                  }`}
                />
                <div
                  className={`relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                    czyDzis
                      ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-700'
                      : 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700'
                  }`}
                >
                  <CalendarIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold leading-tight text-white drop-shadow-lg capitalize truncate">
                  {czyDzis ? 'Dzisiaj' : formatDnia.split(',')[0]}
                </h1>
                <p className="text-xs text-white/70 font-medium mt-0.5 capitalize truncate drop-shadow">
                  {formatDnia}
                </p>
              </div>
            </div>
          </header>

          {!treningi || treningi.length === 0 ? (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-10 text-center animate-fadeIn shadow-2xl shadow-black/60">
              <div className="w-20 h-20 rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-5">
                <CalendarIcon className="w-10 h-10 text-white/40" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-xl mb-2 text-white drop-shadow">
                Brak wydarzeń
              </h3>
              <p className="text-sm text-white/60 mb-6 max-w-xs mx-auto">
                W tym dniu nie ma zaplanowanego żadnego treningu, meczu ani
                sparingu.
              </p>
              <Link
                href="/kalendarz/nowy"
                className="group inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Dodaj wydarzenie w tym dniu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1 animate-fadeIn">
                <CalendarIcon className="w-3.5 h-3.5 text-green-400" />
                <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest drop-shadow">
                  {treningi.length}{' '}
                  {treningi.length === 1 ? 'wydarzenie' : 'wydarzenia'}
                </h2>
              </div>

              {treningi.map((t, i) => {
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
                  <Link
                    key={t.id}
                    href={`/kalendarz/${t.id}/obecnosc`}
                    className={`group block bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-slate-900 hover:border-white/30 transition-all hover:-translate-y-0.5 shadow-xl shadow-black/40 animate-fadeIn stagger-${Math.min(
                      i + 1,
                      8
                    )}`}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${info.bg} rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity`}
                          />
                          <div
                            className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${info.bg} flex items-center justify-center shadow-lg`}
                          >
                            <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-base drop-shadow">
                            {info.label}
                            {t.przeciwnik && (
                              <span className="text-white/70 font-medium">
                                {' '}
                                vs {t.przeciwnik}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-white/70 flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {t.godzina}
                            </span>
                            {t.miejsce && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {t.miejsce}
                              </span>
                            )}
                          </div>
                          {s && s.total > 0 && (
                            <div className="text-xs mt-1.5 flex items-center gap-1.5">
                              <Users className={`w-3 h-3 ${frekwencjaKolor}`} />
                              <span className={`font-medium ${frekwencjaKolor}`}>
                                {s.obecni}/{s.total} obecnych
                              </span>
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>

                      {t.notatki && (
                        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60 whitespace-pre-wrap">
                          📝 {t.notatki}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}

              <Link
                href="/kalendarz/nowy"
                className="group flex items-center justify-center gap-2 bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-dashed border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium px-4 py-3 rounded-2xl text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Dodaj kolejne wydarzenie
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}