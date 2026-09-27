import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Users,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Plus,
} from 'lucide-react';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const params = await searchParams;

  const dzis = new Date();
  let rok = dzis.getFullYear();
  let miesiac = dzis.getMonth();

  if (params.m) {
    const parts = params.m.split('-');
    const r = Number(parts[0]);
    const m = Number(parts[1]);
    if (!isNaN(r) && !isNaN(m) && m >= 1 && m <= 12) {
      rok = r;
      miesiac = m - 1;
    }
  }

  const supabase = await createClient();
  const { data: treningi } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, miejsce')
    .order('data', { ascending: true });

  const eventMap = new Map<string, any[]>();
  (treningi ?? []).forEach((t) => {
    if (!eventMap.has(t.data)) eventMap.set(t.data, []);
    eventMap.get(t.data)!.push(t);
  });

  const pierwszyDzien = new Date(rok, miesiac, 1);
  const ostatniDzien = new Date(rok, miesiac + 1, 0);
  const dniWMiesiacu = ostatniDzien.getDate();

  let offset = pierwszyDzien.getDay() - 1;
  if (offset < 0) offset = 6;

  const dni: (number | null)[] = [];
  for (let i = 0; i < offset; i++) dni.push(null);
  for (let d = 1; d <= dniWMiesiacu; d++) dni.push(d);
  while (dni.length % 7 !== 0) dni.push(null);

  const nazwyMiesiecy = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
  ];

  const dniTygodnia = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

  const prevM = miesiac === 0 ? 12 : miesiac;
  const prevR = miesiac === 0 ? rok - 1 : rok;
  const nextM = miesiac === 11 ? 1 : miesiac + 2;
  const nextR = miesiac === 11 ? rok + 1 : rok;

  const dzisStr = `${dzis.getFullYear()}-${String(dzis.getMonth() + 1).padStart(2, '0')}-${String(dzis.getDate()).padStart(2, '0')}`;

  const typKolor = (typ: string) => {
    if (typ === 'mecz') return 'bg-red-500';
    if (typ === 'sparing') return 'bg-orange-500';
    if (typ === 'turniej') return 'bg-purple-500';
    return 'bg-blue-500';
  };

  const poczatek = `${rok}-${String(miesiac + 1).padStart(2, '0')}-01`;
  const koniec = `${rok}-${String(miesiac + 1).padStart(2, '0')}-${String(dniWMiesiacu).padStart(2, '0')}`;

  const wydarzeniaWMiesiacu = (treningi ?? []).filter(
    (t) => t.data >= poczatek && t.data <= koniec
  );

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

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
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
                    Kalendarz
                  </h1>
                  <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
                    Plan miesiąca
                  </p>
                </div>
              </div>
              <UserAvatar />
            </div>

            <div className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-xl shadow-black/50">
              <Link
                href={`/dashboard?m=${prevR}-${String(prevM).padStart(2, '0')}`}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="text-center">
                <div className="font-bold text-white text-lg">
                  {nazwyMiesiecy[miesiac]} {rok}
                </div>
                <div className="text-xs text-white/60">
                  {wydarzeniaWMiesiacu.length}{' '}
                  {wydarzeniaWMiesiacu.length === 1 ? 'wydarzenie' : 'wydarzeń'}
                </div>
              </div>
              <Link
                href={`/dashboard?m=${nextR}-${String(nextM).padStart(2, '0')}`}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </header>

          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 mb-5 animate-fadeIn shadow-2xl shadow-black/60">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dniTygodnia.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-bold text-white/40 uppercase py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {dni.map((d, i) => {
                if (d === null) {
                  return <div key={i} className="aspect-square" />;
                }

                const dateStr = `${rok}-${String(miesiac + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const eventy = eventMap.get(dateStr) ?? [];
                const czyDzis = dateStr === dzisStr;
                const maEventy = eventy.length > 0;

                const href =
                  eventy.length === 1
                    ? `/kalendarz/${eventy[0].id}/obecnosc`
                    : `/dashboard/${dateStr}`;

                return (
                  <Link
                    key={i}
                    href={href}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      czyDzis
                        ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50 border-2 border-green-300'
                        : maEventy
                        ? 'bg-slate-800 border border-white/20 shadow-md hover:border-white/40'
                        : 'bg-slate-800/40 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        czyDzis
                          ? 'text-white drop-shadow'
                          : maEventy
                          ? 'text-white'
                          : 'text-white/50'
                      }`}
                    >
                      {d}
                    </span>
                    {maEventy && (
                      <div className="flex gap-0.5 mt-0.5">
                        {eventy.slice(0, 3).map((e, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${typKolor(e.typ)} shadow-sm`}
                          />
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-white/70">Trening</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                <span className="text-white/70">Mecz</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
                <span className="text-white/70">Sparing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
                <span className="text-white/70">Turniej</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-5 animate-fadeIn">
            <Link
              href="/kalendarz/nowy"
              className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-4 py-3 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Dodaj wydarzenie
            </Link>
            <Link
              href="/kadra"
              className="hidden md:flex group items-center justify-center gap-2 bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 text-white font-medium px-4 py-3 rounded-2xl text-sm transition-all"
            >
              <Users className="w-4 h-4 text-blue-300" />
              Kadra
            </Link>
            <Link
              href="/statystyki"
              className="hidden md:flex group items-center justify-center gap-2 bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 text-white font-medium px-4 py-3 rounded-2xl text-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 text-purple-300" />
              Statystyki
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}