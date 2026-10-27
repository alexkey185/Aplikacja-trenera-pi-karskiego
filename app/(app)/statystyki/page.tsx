import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, getActiveDruzyna } from '@/lib/druzyny';
import { pad2, toISO, formatMiesiac } from '@/lib/dates';
import { TopBar } from '@/components/TopBar';
import { MiesiacDropdown } from '@/components/MiesiacDropdown';
import { OkresDropdown } from '@/components/OkresDropdown';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { ArrowLeft, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import { StatystykiClient } from './StatystykiClient';

type Zakres = { od: string; do: string; label: string; typ: string };

function getZakres(okres: string, m?: string): Zakres {
  const dzis = new Date();
  const rok = dzis.getFullYear();
  const miesiac = dzis.getMonth();

  if (okres === '30dni') {
    const od = new Date(dzis); od.setDate(od.getDate() - 30);
    return { od: toISO(od), do: toISO(dzis), label: 'Ostatnie 30 dni', typ: '30dni' };
  }
  if (okres === '3mies') {
    const od = new Date(dzis); od.setDate(od.getDate() - 90);
    return { od: toISO(od), do: toISO(dzis), label: 'Ostatnie 3 miesiące', typ: '3mies' };
  }
  if (okres === 'sezon') {
    const rokStart = miesiac >= 8 ? rok : rok - 1;
    return { od: toISO(new Date(rokStart, 8, 1)), do: toISO(new Date(rokStart + 1, 5, 30)), label: `Sezon ${rokStart}/${String(rokStart + 1).slice(2)}`, typ: 'sezon' };
  }
  if (okres === 'month' && m && /^\d{4}-\d{2}$/.test(m)) {
    const [rr, mm] = m.split('-').map(Number);
    const od = new Date(rr, mm - 1, 1);
    const do_ = new Date(rr, mm, 0);
    const nazwa = od.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    return { od: toISO(od), do: toISO(do_), label: nazwa.charAt(0).toUpperCase() + nazwa.slice(1), typ: 'month' };
  }
  return { od: '1900-01-01', do: toISO(new Date()), label: 'Cały okres', typ: 'all' };
}

function formatKrotkaMiesiac(iso: string): string {
  const [rr, mm] = iso.split('-').map(Number);
  const label = new Date(rr, mm - 1, 1).toLocaleDateString('pl-PL', { month: 'short' }).replace('.', '');
  return label.charAt(0).toUpperCase() + label.slice(1, 3);
}

function formatZakres(od: string, do_: string): string {
  const d1 = new Date(od + 'T00:00:00'); const d2 = new Date(do_ + 'T00:00:00');
  return `${pad2(d1.getDate())}.${pad2(d1.getMonth() + 1)}.${d1.getFullYear()} - ${pad2(d2.getDate())}.${pad2(d2.getMonth() + 1)}.${d2.getFullYear()}`;
}

export default async function Statystyki({ searchParams }: { searchParams: Promise<{ okres?: string; m?: string }> }) {
  const params = await searchParams;
  const dzis = new Date();
  const biezacyMiesiac = `${dzis.getFullYear()}-${pad2(dzis.getMonth() + 1)}`;
  const okres = params.okres ?? 'month';
  const m = params.m ?? (okres === 'month' ? biezacyMiesiac : undefined);

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const activeDruzyna = await getActiveDruzyna();
  const zakres = getZakres(okres, m);

  const { data: rpcData } = await supabase.rpc('get_statystyki_druzyny', {
    p_druzyna_id: druzynaId, p_od: zakres.od, p_do: zakres.do, p_miesiace: 6,
  });

  const raw = (rpcData ?? {}) as any;
  const stats = raw.stats ?? { total_treningi: 0, total_wpisy: 0, obecni_razem: 0, treningi_z_wpisami: 0, treningi_bez_wpisow: [] };
  const ranking = raw.ranking ?? [];
  const miesiace = raw.miesiace ?? [];

  const { data: miesiaceRaw } = await supabase.rpc('get_miesiace_druzyny', { p_druzyna_id: druzynaId });
  const unikalneMiesiace = ((miesiaceRaw ?? []) as { miesiac: string }[]).map((r) => r.miesiac);

  const totalWpisy = stats.total_wpisy;
  const obecniRazem = stats.obecni_razem;
  const procentOgolem = totalWpisy > 0 ? Math.round((obecniRazem / totalWpisy) * 100) : 0;
  const treningiZWpisami = stats.treningi_z_wpisami;

  const rankingZBraki = ranking.map((r: any) => ({ ...r, brakuje: treningiZWpisami - r.wpisy }));
  const liczbaDoPoprawy = rankingZBraki.filter((r: any) => r.procent < 70).length;
  const miesiaceWykres = miesiace.map((mm: any) => ({ ...mm, label: formatKrotkaMiesiac(mm.iso) }));
  const najlepszy = miesiaceWykres.filter((mm: any) => mm.procent !== null).sort((a: any, b: any) => (b.procent ?? 0) - (a.procent ?? 0))[0];

  const miesiaceDropdown = unikalneMiesiace.map((mm: string) => {
    const monthRow = miesiaceWykres.find((x: any) => x.iso === mm);
    return { iso: mm, label: formatMiesiac(mm), treningi: monthRow?.treningi ?? 0, procent: monthRow?.procent ?? 0 };
  });

  const PRESETY = [{ key: '30dni', label: 'Ostatnie 30 dni' }, { key: '3mies', label: 'Ostatnie 3 miesiące' }, { key: 'sezon', label: 'Ten sezon' }, { key: 'all', label: 'Cały okres' }];
  const okresUrl = (o: string, mm?: string) => {
    const p = new URLSearchParams(); p.set('okres', o); if (mm) p.set('m', mm);
    return `/statystyki?${p.toString()}`;
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <Link href="/kadra" className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PageHeaderLogo icon={BarChart3} logoUrl={activeDruzyna?.logo_url ?? null} color="purple" />
          <div className="flex-1 min-w-0"><h1 className="text-xl md:text-2xl font-bold leading-tight text-white drop-shadow-lg">Statystyki</h1><p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">Frekwencja drużyny</p></div>
        </div>
        <TopBar />
      </header>

      <div className="mb-5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 md:p-4 relative z-30">
        <div className="lg:hidden">
          <div className="flex items-center gap-2 mb-2"><CalendarIcon className="w-4 h-4 text-white/50" /><span className="text-xs font-bold text-white/60 uppercase tracking-widest">Okres</span></div>
          <OkresDropdown presety={PRESETY} miesiace={miesiaceDropdown} aktywnyPreset={zakres.typ === 'month' ? null : zakres.typ} aktywnyMiesiac={zakres.typ === 'month' ? m ?? null : null} />
        </div>
        <div className="hidden lg:flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-shrink-0"><CalendarIcon className="w-4 h-4 text-white/50" /><span className="text-xs font-bold text-white/60 uppercase tracking-widest">Okres</span></div>
          <div className="flex gap-1.5 flex-wrap">
            {PRESETY.map((p) => {
              const active = zakres.typ === p.key;
              return <Link key={p.key} href={okresUrl(p.key)} className={`px-3 md:px-4 py-2 rounded-xl border text-xs md:text-sm font-semibold transition-all ${active ? 'bg-green-500/15 border-green-400/50 text-green-400' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/25'}`}>{p.label}</Link>;
            })}
            <MiesiacDropdown miesiace={miesiaceDropdown} aktywny={zakres.typ === 'month' ? m ?? null : null} sort="obecnosci" />
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-white/50"><span>Zakres: <span className="text-white/80 font-semibold">{formatZakres(zakres.od, zakres.do)}</span></span></div>
        </div>
      </div>

      <StatystykiClient 
        zakres={zakres} totalTreningi={stats.total_treningi} totalWpisy={totalWpisy} obecniRazem={obecniRazem} procentOgolem={procentOgolem}
        treningiZWpisami={treningiZWpisami} treningiBezWpisow={stats.treningi_bez_wpisow} rankingZBraki={rankingZBraki} liczbaDoPoprawy={liczbaDoPoprawy}
        miesiaceWykres={miesiaceWykres} najlepszy={najlepszy} m={m}
      />
    </div>
  );
}