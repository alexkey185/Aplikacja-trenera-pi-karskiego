'use client';

import Link from 'next/link';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Trophy,
  BarChart3,
} from 'lucide-react';
import { formatMiesiac, formatDataKrotka } from '@/lib/dates';

export function StatystykiClient({ 
  zakres, totalTreningi, totalWpisy, obecniRazem, procentOgolem, 
  treningiZWpisami, treningiBezWpisow, rankingZBraki, liczbaDoPoprawy, 
  miesiaceWykres, najlepszy, m
}: any) {
  const nieobecniRazem = totalWpisy - obecniRazem;
  const maLuki = treningiBezWpisow.length > 0;

  const doPoprawy = rankingZBraki.filter((r: any) => r.procent < 70).sort((a: any, b: any) => a.procent - b.procent);

  return (
    <div className="space-y-5 animate-fadeIn">
      {maLuki && (
        <div className="bg-amber-500/10 border border-amber-400/40 rounded-2xl p-4 md:p-5 shadow-lg shadow-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-amber-200 text-sm md:text-base">
                {treningiBezWpisow.length === 1 ? '1 trening bez zapisanej obecności' : `${treningiBezWpisow.length} treningi bez zapisanej obecności`}
              </div>
              <div className="text-xs md:text-sm text-amber-200/70 mt-1 leading-relaxed">
                W okresie <strong className="text-amber-200">{zakres.label}</strong> masz zaległe treningi.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {treningiBezWpisow.slice(0, 3).map((t: any) => (
                  <Link key={t.id} href={`/kalendarz/${t.id}/obecnosc`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 text-xs font-semibold transition-all">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatDataKrotka(t.data)}
                    <span className="text-amber-400 font-bold">Uzupełnij →</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-2.5">
        <Kafelek label="Frekwencja" value={`${procentOgolem}%`} sub={`${totalWpisy} wpisów`} icon={TrendingUp} color="green" />
        <Kafelek label="Treningi" value={totalTreningi} sub={zakres.label} icon={CalendarIcon} color="blue" />
        <Kafelek label="Zawodnicy" value={rankingZBraki.length} sub="z wpisami" icon={Users} color="purple" />
        <Kafelek label="Do poprawy" value={liczbaDoPoprawy} sub="Frekwencja < 70%" icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <h3 className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">Frekwencja - ostatnie 6 miesięcy</h3>
                </div>
              </div>
              {najlepszy && (
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Najlepszy</div>
                  <div className="text-sm md:text-base font-bold text-green-400">{formatMiesiac(najlepszy.iso).split(' ')[0]} · {najlepszy.procent}%</div>
                </div>
              )}
            </div>

            <div className="relative h-56 pl-12 pr-2 pb-8">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pl-12">
                {[100, 75, 50, 25, 0].map((v) => (
                  <div key={v} className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 w-8 text-right">{v}%</span>
                    <div className={`flex-1 border-t ${v === 0 ? 'border-white/10' : 'border-dashed border-white/5'}`} />
                  </div>
                ))}
              </div>
              <div className="relative h-full flex items-end gap-2 md:gap-3 pl-12 pr-2 pb-6">
                {miesiaceWykres.map((mm: any) => {
                  const isEmpty = mm.procent === null;
                  const isSelected = zakres.typ === 'month' && m === mm.iso;
                  return (
                    <div key={mm.iso} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                      {!isEmpty && <div className="absolute -top-0 left-1/2 -translate-x-1/2 text-sm font-bold text-white whitespace-nowrap mb-1">{mm.procent}%</div>}
                      <div className={`w-full rounded-t-xl transition-all ${isEmpty ? 'bg-slate-700/40 h-1' : isSelected ? 'bg-gradient-to-t from-green-700 to-green-400 shadow-lg ring-2 ring-green-400/60' : 'bg-gradient-to-t from-green-700 to-green-400 shadow-lg'}`} style={isEmpty ? undefined : { height: `${mm.procent}%` }} />
                      <div className={`absolute bottom-0 text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-green-400 font-bold' : isEmpty ? 'text-white/30' : 'text-white/60'}`}>{mm.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl shadow-black/60">
             <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
              <h3 className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">Rozkład obecności</h3>
            </div>
            <p className="text-xs text-white/50 mb-5">Wszystkie wpisy z <strong className="text-white/70">{zakres.label}</strong> ({totalWpisy} wpisów z {treningiZWpisami} treningów)</p>
            
            {totalWpisy > 0 && (
              <div className="flex items-center gap-6 md:gap-8 flex-wrap">
                <div className="relative flex-shrink-0">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="22" />
                    <circle cx="80" cy="80" r="65" fill="none" stroke="#22c55e" strokeWidth="22" strokeDasharray={`${(obecniRazem / totalWpisy) * 408} 408`} transform="rotate(-90 80 80)" />
                    <circle cx="80" cy="80" r="65" fill="none" stroke="#ef4444" strokeWidth="22" strokeDasharray={`${(nieobecniRazem / totalWpisy) * 408} 408`} strokeDashoffset={-((obecniRazem / totalWpisy) * 408)} transform="rotate(-90 80 80)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-black text-white leading-none">{procentOgolem}%</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Frekwencja</div>
                  </div>
                </div>
                <div className="flex-1 min-w-[240px] grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <div className="flex items-center gap-3 bg-green-500/10 border border-green-400/30 rounded-2xl p-3">
                      <div className="w-11 h-11 rounded-xl bg-green-500/20 border border-green-400/40 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-5 h-5 text-green-400" /></div>
                      <div className="flex-1 min-w-0"><div className="text-2xl font-black text-white">{obecniRazem}</div><div className="text-xs text-green-400 font-semibold">Obecny</div></div>
                   </div>
                   <div className="flex items-center gap-3 bg-red-500/10 border border-red-400/30 rounded-2xl p-3">
                      <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center flex-shrink-0"><XCircle className="w-5 h-5 text-red-400" /></div>
                      <div className="flex-1 min-w-0"><div className="text-2xl font-black text-white">{nieobecniRazem}</div><div className="text-xs text-red-400 font-semibold">Nieobecny</div></div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-5">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-2xl shadow-black/60">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" strokeWidth={2.5} />
              <h3 className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">Ranking zawodników</h3>
            </div>
            <p className="text-xs text-white/50 mb-4">{zakres.label} · {rankingZBraki.length} zawodników</p>

            {rankingZBraki.length === 0 ? (
              <div className="text-center py-8 text-sm text-white/40">Brak danych w tym okresie</div>
            ) : (
              <ul className="space-y-1.5">
                {rankingZBraki.map((r: any, i: number) => {
                  const colorClass = r.procent >= 80 ? 'text-green-400' : r.procent >= 60 ? 'text-amber-400' : 'text-red-400';
                  return (
                    <li key={r.id} className="flex items-center gap-3 py-2.5 px-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-white/70">{i + 1}</span></div>
                      <Link href={`/zawodnicy/${r.id}`} className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{r.imie} {r.nazwisko}</div>
                        <div className="text-[10px] text-white/50">{r.obecnosci} z {treningiZWpisami} {r.brakuje > 0 && <span className="text-amber-400 font-semibold">· brak {r.brakuje}</span>}</div>
                      </Link>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-black leading-none ${colorClass}`}>{r.obecnosci}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{r.procent}%</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {doPoprawy.length > 0 && (
             <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-2xl shadow-black/60">
                <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={2.5} /><h3 className="text-xs font-bold text-red-400/90 uppercase tracking-widest">Wymaga uwagi</h3></div>
                <ul className="space-y-2">
                  {doPoprawy.slice(0, 5).map((r: any) => {
                    const inicjaly = `${r.imie.charAt(0)}${r.nazwisko.charAt(0)}`.toUpperCase();
                    const colorClass = r.procent >= 60 ? 'text-amber-400' : 'text-red-400';
                    return (
                      <li key={r.id} className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg bg-red-500/5 border border-red-400/15">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/70 flex-shrink-0">{inicjaly}</div>
                        <Link href={`/zawodnicy/${r.id}`} className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{r.imie} {r.nazwisko}</div>
                        </Link>
                        <div className={`text-sm font-black ${colorClass}`}>{r.procent}%</div>
                      </li>
                    );
                  })}
                </ul>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kafelek({ label, value, sub, icon: Icon, color }: any) {
  const colors = {
    green: 'from-green-500/20 to-green-700/10 border-green-400/30 text-green-400 bg-green-500/20 border-green-400/40',
    blue: 'from-blue-500/20 to-blue-700/10 border-blue-400/30 text-blue-400 bg-blue-500/20 border-blue-400/40',
    purple: 'from-purple-500/20 to-purple-700/10 border-purple-400/30 text-purple-400 bg-purple-500/20 border-purple-400/40',
    red: 'from-red-500/20 to-red-700/10 border-red-400/30 text-red-400 bg-red-500/20 border-red-400/40'
  }[color as string];

  return (
    <div className={`rounded-xl lg:rounded-lg px-2.5 lg:px-3 py-2 lg:py-2.5 bg-gradient-to-br ${colors?.split(' ')[0]} ${colors?.split(' ')[1]} border ${colors?.split(' ')[2]} shadow-sm shadow-black/20`}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-5 h-5 rounded-md ${colors?.split(' ')[4]} border ${colors?.split(' ')[5]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3 h-3 ${colors?.split(' ')[3]}`} strokeWidth={2.5} />
        </div>
        <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider truncate">{label}</div>
      </div>
      <div className="text-lg md:text-xl font-black text-white leading-none">{value}</div>
      <div className="text-[9px] text-white/50 mt-0.5 leading-tight truncate">{sub}</div>
    </div>
  );
}