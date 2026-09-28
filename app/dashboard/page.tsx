import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Trophy,
  Clock,
  MapPin,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const params = await searchParams;

  const teraz = new Date();
  const dzisStr = toISO(teraz);

  let poniedzialek = getMonday(teraz);
  if (params.w) {
    const parsed = new Date(params.w + 'T00:00:00');
    if (!isNaN(parsed.getTime())) {
      poniedzialek = getMonday(parsed);
    }
  }

  const niedziela = addDays(poniedzialek, 6);

  const supabase = await createClient();
  const { data: treningi } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, miejsce')
    .order('data', { ascending: true })
    .order('godzina', { ascending: true });

  const { data: obecnosci } = await supabase
    .from('obecnosc')
    .select('trening_id, status');

  const stats = new Map<number, { obecni: number; nieobecni: number }>();
  (obecnosci ?? []).forEach((o) => {
    const s = stats.get(o.trening_id) ?? { obecni: 0, nieobecni: 0 };
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    else s.nieobecni += 1;
    stats.set(o.trening_id, s);
  });

  const dni = Array.from({ length: 7 }, (_, i) => addDays(poniedzialek, i));

  const eventMap = new Map<string, any[]>();
  (treningi ?? []).forEach((t) => {
    if (!eventMap.has(t.data)) eventMap.set(t.data, []);
    eventMap.get(t.data)!.push(t);
  });

  const dzisiejsze = eventMap.get(dzisStr) ?? [];
  const jestWTygodniu =
    dzisStr >= toISO(poniedzialek) && dzisStr <= toISO(niedziela);

  const prevWeek = toISO(addDays(poniedzialek, -7));
  const nextWeek = toISO(addDays(poniedzialek, 7));

  const formatDzienTyg = (date: Date) =>
    date.toLocaleDateString('pl-PL', { weekday: 'short' }).replace('.', '');

  const formatMiesiacRok = (date: Date) =>
    date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  const typKolor = (typ: string) => {
    if (typ === 'mecz') return 'bg-red-500';
    if (typ === 'sparing') return 'bg-orange-500';
    if (typ === 'turniej') return 'bg-purple-500';
    return 'bg-blue-500';
  };

  const typBorder = (typ: string) => {
    if (typ === 'mecz') return 'border-l-red-500';
    if (typ === 'sparing') return 'border-l-orange-500';
    if (typ === 'turniej') return 'border-l-purple-500';
    return 'border-l-blue-500';
  };

  const typIkona = (typ: string) => {
    if (typ === 'mecz') return Trophy;
    return CalendarIcon;
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.png"
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
          src="/talent-bg.png"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 lg:p-8 pb-28">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <header className="mb-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-2xl">
                    <CalendarIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
                    Tydzień
                  </h1>
                  <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow capitalize">
                    {formatMiesiacRok(poniedzialek)}
                  </p>
                </div>
              </div>
              <UserAvatar />
            </div>
          </header>

          {/* TIMELINE — 7 DNI */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 mb-5 animate-fadeIn shadow-2xl shadow-black/60">
            {/* Nawigacja tygodnia */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/dashboard?w=${prevWeek}`}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <div className="font-bold text-white text-sm capitalize">
                  {poniedzialek.toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: 'long',
                  })}{' '}
                  —{' '}
                  {niedziela.toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: 'long',
                  })}
                </div>
                {jestWTygodniu && (
                  <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">
                    Bieżący tydzień
                  </div>
                )}
              </div>
              <Link
                href={`/dashboard?w=${nextWeek}`}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Siatka 7 dni */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {dni.map((d, i) => {
                const dataStr = toISO(d);
                const eventy = eventMap.get(dataStr) ?? [];
                const czyDzis = dataStr === dzisStr;
                const maEventy = eventy.length > 0;

                return (
                  <Link
                    key={i}
                    href={`/dashboard/${dataStr}`}
                    className={`group relative rounded-2xl p-2 md:p-3 transition-all hover:-translate-y-0.5 min-h-[140px] md:min-h-[180px] flex flex-col ${
                      czyDzis
                        ? 'bg-gradient-to-b from-green-500/20 to-green-700/5 border border-green-400/40 shadow-lg shadow-green-500/20'
                        : 'bg-slate-800/50 border border-white/5 hover:border-white/20 hover:bg-slate-800'
                    }`}
                  >
                    {/* Nagłówek dnia */}
                    <div className="mb-2 flex-shrink-0">
                      <div
                        className={`text-[9px] md:text-[10px] uppercase tracking-widest font-bold ${
                          czyDzis ? 'text-green-300' : 'text-white/40'
                        }`}
                      >
                        {formatDzienTyg(d)}
                      </div>
                      <div
                        className={`text-lg md:text-2xl font-black leading-none mt-0.5 ${
                          czyDzis ? 'text-green-400' : 'text-white'
                        }`}
                      >
                        {d.getDate()}
                      </div>
                    </div>

                    {/* Wydarzenia */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {eventy.slice(0, 3).map((t: any) => (
                        <div
                          key={t.id}
                          className={`text-[9px] md:text-[10px] rounded-md border-l-2 px-1.5 py-1 text-white truncate ${typBorder(
                            t.typ
                          )} bg-white/5`}
                        >
                          <div className="font-bold leading-tight">{t.godzina}</div>
                          <div className="truncate text-white/70 leading-tight capitalize">
                            {t.typ}
                          </div>
                        </div>
                      ))}
                      {eventy.length > 3 && (
                        <div className="text-[9px] text-white/40 text-center pt-0.5">
                          +{eventy.length - 3} więcej
                        </div>
                      )}
                    </div>

                    {/* Wskaźniki na dole */}
                    {maEventy && (
                      <div className="flex gap-0.5 mt-1 flex-shrink-0">
                        {eventy.slice(0, 4).map((e: any, idx) => (
                          <div
                            key={idx}
                            className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${typKolor(
                              e.typ
                            )}`}
                          />
                        ))}
                      </div>
                    )}

                    {czyDzis && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400 rounded-full shadow-lg shadow-green-400/60" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/10 text-[10px] flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-white/60">Trening</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-white/60">Mecz</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-white/60">Sparing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-white/60">Turniej</span>
              </div>
            </div>
          </div>

          {/* DZISIAJ — szczegóły */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-5 animate-fadeIn shadow-xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Dzisiaj · {teraz.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })}
              </h2>
            </div>

            {dzisiejsze.length === 0 ? (
              <div className="text-center py-6 text-white/40 text-sm">
                Brak wydarzeń na dziś
              </div>
            ) : (
              <div className="space-y-2">
                {dzisiejsze.map((t: any) => {
                  const Icon = typIkona(t.typ);
                  const s = stats.get(t.id);
                  return (
                    <Link
                      key={t.id}
                      href={`/kalendarz/${t.id}/obecnosc`}
                      className={`group flex items-center gap-4 p-3 rounded-2xl border-l-4 ${typBorder(
                        t.typ
                      )} bg-white/5 hover:bg-white/10 transition-all`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-lg font-bold text-white leading-none">
                          {t.godzina}
                        </div>
                      </div>
                      <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate capitalize">
                          {t.typ}
                          {t.przeciwnik && (
                            <span className="text-white/60 font-normal">
                              {' '}
                              vs {t.przeciwnik}
                            </span>
                          )}
                        </div>
                        {t.miejsce && (
                          <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{t.miejsce}</span>
                          </div>
                        )}
                        {s && (s.obecni > 0 || s.nieobecni > 0) && (
                          <div className="text-xs mt-1 flex items-center gap-3">
                            <span className="text-green-400 font-medium">
                              ✓ {s.obecni}
                            </span>
                            {s.nieobecni > 0 && (
                              <span className="text-red-400 font-medium">
                                ✗ {s.nieobecni}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-white/40 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* SZYBKIE AKCJE */}
          <div className="grid grid-cols-3 gap-3 animate-fadeIn">
            <Link
              href="/kalendarz/nowy"
              className="group bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-green-400/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-400/30 flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-400 group-hover:rotate-90 transition-transform" />
              </div>
              <span className="text-xs font-semibold text-white/80">
                Nowe wydarzenie
              </span>
            </Link>
            <Link
              href="/kadra"
              className="group bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-blue-400/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-white/80">Kadra</span>
            </Link>
            <Link
              href="/kalendarz"
              className="group bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-purple-400/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-white/80">
                Pełny plan
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}