import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDruzyny, getActiveDruzynaId, getActiveDruzyna } from '@/lib/druzyny';
import { TopBar } from '@/components/TopBar';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { ArrowLeft, Users, Plus, Pencil, Check } from 'lucide-react';

const KOLORY: Record<string, string> = {
  green: 'from-green-400 to-green-700',
  blue: 'from-blue-400 to-blue-700',
  purple: 'from-purple-400 to-purple-700',
  orange: 'from-orange-400 to-orange-700',
  red: 'from-red-400 to-red-700',
  yellow: 'from-yellow-400 to-yellow-700',
  pink: 'from-pink-400 to-pink-700',
  slate: 'from-slate-500 to-slate-700',
};

export default async function DruzynyPage() {
  const supabase = await createClient();
  const druzyny = await getDruzyny();
  const activeId = await getActiveDruzynaId();
  const activeDruzyna = await getActiveDruzyna();

  const { data: zawodnicy } = await supabase.from('zawodnicy').select('druzyna_id');

  const countMap: Record<string, number> = {};
  (zawodnicy ?? []).forEach((z) => {
    if (z.druzyna_id) {
      countMap[z.druzyna_id] = (countMap[z.druzyna_id] ?? 0) + 1;
    }
  });

  const totalZawodnikow = (zawodnicy ?? []).length;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PageHeaderLogo icon={Users} logoUrl={activeDruzyna?.logo_url ?? null} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Drużyny</h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
              {druzyny.length} {druzyny.length === 1 ? 'drużyna' : 'drużyn'} · {totalZawodnikow} zawodników
            </p>
          </div>
        </div>
        <TopBar />
      </header>

      {druzyny.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center animate-fadeIn shadow-2xl shadow-black/60 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <Users className="w-10 h-10 text-green-400" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-xl mb-2 text-white drop-shadow">Zacznijmy od drużyny</h3>
            <p className="text-sm text-white/60 mb-6 max-w-xs mx-auto">
              Utwórz pierwszą drużynę, żeby zarządzać zawodnikami i planować treningi.
            </p>
            <Link href="/druzyny/nowa" className="group inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Utwórz pierwszą drużynę
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {druzyny.map((d) => {
              const isActive = d.id === activeId;
              const gradient = KOLORY[d.kolor] ?? KOLORY.green;
              const count = countMap[d.id] ?? 0;
              const inicjal = d.nazwa.charAt(0).toUpperCase();
              return (
                <div
                  key={d.id}
                  className={`group relative flex items-center gap-4 backdrop-blur-md border rounded-2xl p-4 transition-all ${
                    isActive
                      ? 'bg-white/5 border-green-400/40 shadow-lg shadow-green-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-green-500" />
                  )}

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 font-black text-lg text-white shadow-lg overflow-hidden`}>
                    {d.logo_url ? (
                      <img src={d.logo_url} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      inicjal
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white truncate">{d.nazwa}</span>
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-green-400 bg-green-500/15 border border-green-400/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} /> Aktywna
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      {d.rocznik ? `Rocznik ${d.rocznik} · ` : ''}
                      {count === 0 ? 'brak zawodników' : `${count} ${count === 1 ? 'zawodnik' : 'zawodników'}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href={`/druzyny/${d.id}/edytuj`} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/60 hover:text-white transition-all" title="Edytuj drużynę">
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/druzyny/nowa" className="group w-full flex items-center justify-center gap-2 bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-dashed border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium px-4 py-3 rounded-2xl text-sm transition-all">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Dodaj kolejną drużynę
          </Link>
        </>
      )}
    </div>
  );
}