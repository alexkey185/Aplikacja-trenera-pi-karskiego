import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { TopBar } from '@/components/TopBar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Clock,
  MapPin,
  ChevronRight as ChevronRightIcon,
  BarChart3 as BarChart3Icon,
  ExternalLink,
  Pencil,
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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
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
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

// Tydzień + 1 miesiąc wstecz + 1 miesiąc do przodu (na nawigację i "Nadchodzące")
const dzisD = new Date();
const odD = new Date(dzisD.getFullYear(), dzisD.getMonth() - 1, 1);
const doD = new Date(dzisD.getFullYear(), dzisD.getMonth() + 2, 0);

const toISODash = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const { data: treningi } = await supabase
  .from('treningi')
  .select('id, data, godzina, typ, przeciwnik, miejsce')
  .eq('druzyna_id', druzynaId)
  .gte('data', toISODash(odD))
  .lte('data', toISODash(doD))
  .order('data', { ascending: true })
  .order('godzina', { ascending: true });

  const treningiIds = (treningi ?? []).map((t) => t.id);

  const { data: obecnosci } =
    treningiIds.length > 0
      ? await supabase
          .from('obecnosc')
          .select('trening_id, status')
          .in('trening_id', treningiIds)
      : { data: [] };

  const stats = new Map<number, { obecni: number; nieobecni: number }>();
  (obecnosci ?? []).forEach((o) => {
    const s = stats.get(o.trening_id) ?? { obecni: 0, nieobecni: 0 };
    if (o.status === 'obecny' || o.status === 'spozniony') s.obecni += 1;
    else s.nieobecni += 1;
    stats.set(o.trening_id, s);
  });

  const dni = Array.from({ length: 7 }, (_, i) => addDays(poniedzialek, i));

  const dniMobile = (() => {
    const startIdx = dni.findIndex((d) => toISO(d) === dzisStr);
    if (startIdx === -1) return dni.slice(0, 3);
    const start = dni.slice(startIdx, startIdx + 3);
    const brakuje = 3 - start.length;
    if (brakuje > 0) {
      const prev = dni.slice(0, startIdx).slice(-brakuje);
      return [...prev, ...start];
    }
    return start;
  })();

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

  const getDayHref = (dataStr: string) => {
    const events = eventMap.get(dataStr) ?? [];
    if (events.length === 1) {
      return `/kalendarz/${events[0].id}/obecnosc`;
    }
    return `/dashboard/${dataStr}`;
  };

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
                  <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">Tydzień</h1>
                  <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow capitalize">{formatMiesiacRok(poniedzialek)}</p>
                </div>
              </div>
              <TopBar />
            </div>
          </header>

          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 mb-5 animate-fadeIn shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between mb-4">
              <Link href={`/dashboard?w=${prevWeek}`} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div className="text-center px-2">
                <div className="font-bold text-white text-sm capitalize">
                  {poniedzialek.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })} — {niedziela.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })}
                </div>
                {jestWTygodniu && <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">Bieżący tydzień</div>}
              </div>
              <Link href={`/dashboard?w=${nextWeek}`} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="md:hidden grid grid-cols-3 gap-2">
              {dniMobile.map((d, i) => {
                const dataStr = toISO(d);
                const eventy = eventMap.get(dataStr) ?? [];
                const czyDzis = dataStr === dzisStr;
                const maEventy = eventy.length > 0;
                const href = getDayHref(dataStr);
                return (
                  <Link key={i} href={href} className={`relative rounded-2xl p-3 transition-all min-h-[180px] flex flex-col ${czyDzis ? 'bg-gradient-to-b from-green-500/20 to-green-700/5 border border-green-400/40 shadow-lg shadow-green-500/20' : 'bg-slate-800/60 border border-white/10'}`}>
                    <div className="mb-3 pb-2 border-b border-white/10">
                      <div className={`text-[10px] uppercase tracking-widest font-bold ${czyDzis ? 'text-green-300' : 'text-white/40'}`}>{formatDzienTyg(d)}</div>
                      <div className={`text-2xl font-black leading-none mt-1 ${czyDzis ? 'text-green-400' : 'text-white'}`}>{d.getDate()}</div>
                      <div className="text-[10px] text-white/40 mt-0.5 capitalize">{d.toLocaleDateString('pl-PL', { month: 'short' })}</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {eventy.length === 0 && <div className="text-[10px] text-white/30 text-center py-2">brak</div>}
                      {eventy.slice(0, 4).map((t: any) => (
                        <div key={t.id} className={`text-[10px] rounded-md border-l-2 px-2 py-1.5 text-white ${typBorder(t.typ)} bg-white/5`}>
                          <div className="font-bold leading-tight">{t.godzina}</div>
                          <div className="text-white/70 leading-tight capitalize truncate">{t.typ}</div>
                        </div>
                      ))}
                      {eventy.length > 4 && <div className="text-[10px] text-white/40 text-center pt-0.5">+{eventy.length - 4}</div>}
                    </div>
                    {maEventy && (
                      <div className="flex gap-1 mt-2">
                        {eventy.slice(0, 5).map((e: any, idx) => (<div key={idx} className={`w-1.5 h-1.5 rounded-full ${typKolor(e.typ)}`} />))}
                      </div>
                    )}
                    {czyDzis && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400 rounded-full shadow-lg shadow-green-400/60" />}
                  </Link>
                );
              })}
            </div>

            <Link href="/kalendarz" className="md:hidden mt-3 flex items-center justify-center gap-2 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 transition-all">
              📅 Zobacz cały tydzień
            </Link>

            <div className="hidden md:grid grid-cols-7 gap-2">
              {dni.map((d, i) => {
                const dataStr = toISO(d);
                const eventy = eventMap.get(dataStr) ?? [];
                const czyDzis = dataStr === dzisStr;
                const maEventy = eventy.length > 0;
                const href = getDayHref(dataStr);
                return (
                  <Link key={i} href={href} className={`group relative rounded-2xl p-3 transition-all hover:-translate-y-0.5 min-h-[180px] flex flex-col ${czyDzis ? 'bg-gradient-to-b from-green-500/20 to-green-700/5 border border-green-400/40 shadow-lg shadow-green-500/20' : 'bg-slate-800/50 border border-white/5 hover:border-white/20 hover:bg-slate-800'}`}>
                    <div className="mb-2 flex-shrink-0">
                      <div className={`text-[10px] uppercase tracking-widest font-bold ${czyDzis ? 'text-green-300' : 'text-white/40'}`}>{formatDzienTyg(d)}</div>
                      <div className={`text-2xl font-black leading-none mt-0.5 ${czyDzis ? 'text-green-400' : 'text-white'}`}>{d.getDate()}</div>
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {eventy.slice(0, 3).map((t: any) => (
                        <div key={t.id} className={`text-[10px] rounded-md border-l-2 px-1.5 py-1 text-white truncate ${typBorder(t.typ)} bg-white/5`}>
                          <div className="font-bold leading-tight">{t.godzina}</div>
                          <div className="truncate text-white/70 leading-tight capitalize">{t.typ}</div>
                        </div>
                      ))}
                      {eventy.length > 3 && <div className="text-[9px] text-white/40 text-center pt-0.5">+{eventy.length - 3} więcej</div>}
                    </div>
                    {maEventy && (
                      <div className="flex gap-0.5 mt-1 flex-shrink-0">
                        {eventy.slice(0, 4).map((e: any, idx) => (<div key={idx} className={`w-1.5 h-1.5 rounded-full ${typKolor(e.typ)}`} />))}
                      </div>
                    )}
                    {czyDzis && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400 rounded-full shadow-lg shadow-green-400/60" />}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/10 text-[10px] flex-wrap">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-white/60">Trening</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-white/60">Mecz</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-white/60">Sparing</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /><span className="text-white/60">Turniej</span></div>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-5 animate-fadeIn shadow-xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Dzisiaj · {teraz.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })}</h2>
            </div>
            {dzisiejsze.length === 0 ? (
              <div className="text-center py-6 text-white/40 text-sm">Brak wydarzeń na dziś</div>
            ) : (
              <div className="space-y-2">
                {dzisiejsze.map((t: any) => {
                  const Icon = typIkona(t.typ);
                  const s = stats.get(t.id);
                  const mapsUrl = t.miejsce?.trim()
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.miejsce.trim())}`
                    : null;
                  return (
                    <div
                      key={t.id}
                      className={`group relative flex items-center gap-2 p-3 rounded-2xl border-l-4 ${typBorder(t.typ)} bg-white/5 hover:bg-white/10 transition-all`}
                    >
                      <Link
                        href={`/kalendarz/${t.id}/obecnosc`}
                        className="absolute inset-0 z-0 rounded-2xl"
                        aria-label={`Przejdź do obecności: ${t.typ}`}
                      />

                      <div className="relative z-10 pointer-events-none flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-shrink-0">
                          <div className="text-lg font-bold text-white leading-none">{t.godzina}</div>
                        </div>
                        <div className="w-px h-10 bg-white/10 flex-shrink-0 hidden sm:block" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate capitalize">
                            {t.typ}
                            {t.przeciwnik && <span className="text-white/60 font-normal"> vs {t.przeciwnik}</span>}
                          </div>

                          {t.miejsce ? (
                            mapsUrl ? (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Otwórz w Google Maps"
                                className="pointer-events-auto text-xs text-white/50 hover:text-green-400 flex items-center gap-1 mt-0.5 w-fit max-w-full transition-colors group/maps"
                              >
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{t.miejsce}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover/maps:opacity-100" />
                              </a>
                            ) : (
                              <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{t.miejsce}</span>
                              </div>
                            )
                          ) : null}

                          {s && (s.obecni > 0 || s.nieobecni > 0) && (
                            <div className="text-xs mt-1 flex items-center gap-3">
                              <span className="text-green-400 font-medium">✓ {s.obecni}</span>
                              {s.nieobecni > 0 && <span className="text-red-400 font-medium">✗ {s.nieobecni}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/kalendarz/${t.id}/edytuj`}
                        title="Edytuj wydarzenie"
                        aria-label="Edytuj wydarzenie"
                        className="hidden md:flex relative z-10 pointer-events-auto w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 items-center justify-center text-white/50 hover:text-white transition-all flex-shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>

                      <ChevronRightIcon className="relative z-10 w-5 h-5 text-white/40 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0 pointer-events-none" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <div className="hidden md:block bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl shadow-black/40">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Nadchodzące</h2>
              </div>
              {(() => {
                const nadchodzace = (treningi ?? []).filter((t) => t.data > dzisStr).sort((a, b) => {
                  const cmp = a.data.localeCompare(b.data);
                  if (cmp !== 0) return cmp;
                  return (a.godzina || '').localeCompare(b.godzina || '');
                }).slice(0, 3);
                if (nadchodzace.length === 0) {
                  return <div className="text-center py-6 text-white/40 text-sm">Brak nadchodzących wydarzeń</div>;
                }
                return (
                  <div className="space-y-2">
                    {nadchodzace.map((t: any) => (
                      <Link key={t.id} href={`/kalendarz/${t.id}/obecnosc`} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${typBorder(t.typ)} bg-white/5 hover:bg-white/10 transition-all`}>
                        <div className="flex-shrink-0 text-center w-10">
                          <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{new Date(t.data + 'T00:00:00').toLocaleDateString('pl-PL', { month: 'short' })}</div>
                          <div className="text-lg font-black text-white leading-none">{new Date(t.data + 'T00:00:00').getDate()}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate capitalize">
                            {t.godzina} · {t.typ}
                            {t.przeciwnik && <span className="text-white/60 font-normal"> vs {t.przeciwnik}</span>}
                          </div>
                          {t.miejsce && <div className="text-[10px] text-white/50 truncate mt-0.5">{t.miejsce}</div>}
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl shadow-black/40">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3Icon className="w-3.5 h-3.5 text-green-400" />
                <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Frekwencja — {teraz.toLocaleDateString('pl-PL', { month: 'long' })}</h2>
              </div>
              {(() => {
                const rokMiesiac = dzisStr.substring(0, 7);
                const treningiMies = (treningi ?? []).filter((t) => t.data.startsWith(rokMiesiac));
                const idsMies = treningiMies.map((t) => t.id);
                const obecnosciMies = (obecnosci ?? []).filter((o) => idsMies.includes(o.trening_id));
                const obecniMies = obecnosciMies.filter((o) => o.status === 'obecny' || o.status === 'spozniony').length;
                const procent = obecnosciMies.length > 0 ? Math.round((obecniMies / obecnosciMies.length) * 100) : 0;
                return (
                  <>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-black text-white leading-none">{procent}</span>
                      <span className="text-2xl text-white/40 font-bold">%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950/60 rounded-full overflow-hidden mb-3 shadow-inner">
                      <div className={`h-full rounded-full transition-all ${procent >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' : procent >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`} style={{ width: `${procent}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span><span className="text-green-400 font-semibold">{obecniMies}</span> obecnych</span>
                      <span>{obecnosciMies.length} wpisów</span>
                    </div>
                    <Link href="/statystyki" className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 transition-all">
                      <BarChart3Icon className="w-3.5 h-3.5" />Zobacz pełne statystyki
                    </Link>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}