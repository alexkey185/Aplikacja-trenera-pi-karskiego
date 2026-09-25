import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { UsunButton } from './UsunButton';
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
  ChevronLeft,
  Pencil,
  Check,
  X,
} from 'lucide-react';

export default async function Kalendarz({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  noStore();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: treningi, error } = await supabase
    .from('treningi')
    .select('*')
    .order('data', { ascending: true });

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

  const teraz = new Date();
  const dzis = teraz.toISOString().split('T')[0];
  const jutro = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Wybrany miesiąc (z URL albo bieżący)
  let rok = teraz.getFullYear();
  let miesiac = teraz.getMonth() + 1; // 1-12

  if (params.m) {
    const parts = params.m.split('-');
    const r = Number(parts[0]);
    const m = Number(parts[1]);
    if (!isNaN(r) && !isNaN(m) && m >= 1 && m <= 12) {
      rok = r;
      miesiac = m;
    }
  }

  const rokMiesiac = `${rok}-${String(miesiac).padStart(2, '0')}`;

  // Nawigacja prev/next
  const prevM = miesiac === 1 ? 12 : miesiac - 1;
  const prevR = miesiac === 1 ? rok - 1 : rok;
  const nextM = miesiac === 12 ? 1 : miesiac + 1;
  const nextR = miesiac === 12 ? rok + 1 : rok;

  const nazwyMiesiecy = [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ];

  const nazwaMiesiaca = `${nazwyMiesiecy[miesiac - 1]} ${rok}`;

  const czyMinelo = (t: any) => {
    const [godzina] = (t.godzina || '00:00').split(':');
    const dataGodzina = new Date(
      `${t.data}T${String(godzina).padStart(2, '0')}:00:00`
    );
    return dataGodzina < teraz;
  };

  const nadchodzace = (treningi ?? [])
    .filter((t) => !czyMinelo(t))
    .sort((a, b) => a.data.localeCompare(b.data));

  const minione = (treningi ?? [])
    .filter((t) => czyMinelo(t))
    .sort((a, b) => b.data.localeCompare(a.data));

  // Statystyki wybranego miesiąca
  const wTymMiesiacu = (treningi ?? []).filter((t) =>
    t.data.startsWith(rokMiesiac)
  );

  const liczbaTypu = (typ: string) =>
    wTymMiesiacu.filter((t) => t.typ === typ).length;

  const statsMiesiac = {
    treningi: liczbaTypu('trening'),
    mecze: liczbaTypu('mecz'),
    sparingi: liczbaTypu('sparing'),
    turnieje: liczbaTypu('turniej'),
    total: wTymMiesiacu.length,
  };

  const grupuj = (lista: any[]) => {
    const mapa = new Map<string, any[]>();
    lista.forEach((t) => {
      if (!mapa.has(t.data)) mapa.set(t.data, []);
      mapa.get(t.data)!.push(t);
    });
    return Array.from(mapa.entries()).map(([data, wydarzenia]) => ({
      data,
      wydarzenia: wydarzenia.sort((a, b) =>
        a.godzina.localeCompare(b.godzina)
      ),
    }));
  };

  const grupyNadchodzace = grupuj(nadchodzace);
  const grupyMinione = grupuj(minione);

  const typInfo = (typ: string) => {
    if (typ === 'mecz')
      return { icon: Trophy, bg: 'from-red-400 to-red-600', label: 'Mecz' };
    if (typ === 'sparing')
      return {
        icon: Flame,
        bg: 'from-orange-400 to-orange-600',
        label: 'Sparing',
      };
    if (typ === 'turniej')
      return {
        icon: Target,
        bg: 'from-purple-400 to-purple-600',
        label: 'Turniej',
      };
    return {
      icon: CalendarIcon,
      bg: 'from-blue-400 to-blue-600',
      label: 'Trening',
    };
  };

  const naglowekDnia = (dataStr: string) => {
    if (dataStr === dzis) return { label: 'Dzisiaj', kolor: 'text-green-400' };
    if (dataStr === jutro) return { label: 'Jutro', kolor: 'text-blue-400' };
    return null;
  };

  const Grupa = ({ grupa, index }: { grupa: any; index: number }) => {
    const data = new Date(grupa.data);
    const naglowek = naglowekDnia(grupa.data);
    const dzienTyg = data.toLocaleDateString('pl-PL', { weekday: 'long' });

    return (
      <div className={`mb-5 animate-fadeIn stagger-${Math.min(index + 1, 8)}`}>
        <div className="flex items-baseline gap-3 mb-2 px-1">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white leading-none drop-shadow">
              {data.toLocaleDateString('pl-PL', { day: '2-digit' })}
            </div>
            <div>
              <div className="text-sm font-bold text-white/90 capitalize">
                {dzienTyg}
              </div>
              <div className="text-xs text-white/50 capitalize">
                {data.toLocaleDateString('pl-PL', { month: 'long' })}
              </div>
            </div>
          </div>
          {naglowek && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${naglowek.kolor} ml-auto bg-white/5 border border-white/10 rounded-full px-2.5 py-1`}
            >
              {naglowek.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <div className="flex-1 h-px bg-gradient-to-r from-white/15 to-transparent" />
        </div>

        <ul className="space-y-2">
          {grupa.wydarzenia.map((t: any) => {
            const info = typInfo(t.typ);
            const Icon = info.icon;
            const s = stats.get(t.id);

            return (
              <li
                key={t.id}
                className="group bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden hover:bg-slate-900 transition-all hover:-translate-y-0.5 shadow-xl shadow-black/40"
              >
                <div className="flex items-center">
                  <Link
                    href={`/kalendarz/${t.id}/obecnosc`}
                    className="flex items-center gap-3 p-3 flex-1 min-w-0"
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${info.bg} rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity`}
                      />
                      <div
                        className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${info.bg} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-14">
                      <div className="text-lg font-bold text-white leading-none">
                        {t.godzina}
                      </div>
                    </div>

                    <div className="w-px h-10 bg-white/10 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">
                        {info.label}
                        {t.przeciwnik && (
                          <span className="text-white/60 font-medium">
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
                        <div className="flex items-center gap-3 mt-1.5">
                          {s.obecni > 0 && (
                            <div className="flex items-center gap-1">
                              <Check
                                className="w-3 h-3 text-green-400"
                                strokeWidth={3}
                              />
                              <span className="text-[11px] font-bold text-green-400">
                                {s.obecni}
                              </span>
                            </div>
                          )}
                          {s.nieobecni > 0 && (
                            <div className="flex items-center gap-1">
                              <X
                                className="w-3 h-3 text-red-400"
                                strokeWidth={3}
                              />
                              <span className="text-[11px] font-bold text-red-400">
                                {s.nieobecni}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>

                  <div className="flex gap-2 flex-shrink-0 mr-3">
                    <Link
                      href={`/kalendarz/${t.id}/edytuj`}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/60 hover:text-white transition-all"
                      title="Edytuj"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <UsunButton id={t.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const jestBiezacyMiesiac =
    rok === teraz.getFullYear() && miesiac === teraz.getMonth() + 1;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
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
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-5">
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

            <Link
              href="/kalendarz/nowy"
              className="group flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold px-4 py-3 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5 w-full"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Dodaj wydarzenie
            </Link>
          </header>

          {/* STATYSTYKI MIESIĄCA + NAWIGACJA */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6 animate-fadeIn shadow-xl shadow-black/40">
            {/* Nawigacja miesięcy */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/kalendarz?m=${prevR}-${String(prevM).padStart(2, '0')}`}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors"
                title="Poprzedni miesiąc"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <div className="font-bold text-white capitalize">
                  {nazwaMiesiaca}
                </div>
                {jestBiezacyMiesiac && (
                  <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">
                    Bieżący
                  </div>
                )}
              </div>
              <Link
                href={`/kalendarz?m=${nextR}-${String(nextM).padStart(2, '0')}`}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors"
                title="Następny miesiąc"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Kafelki */}
            {statsMiesiac.total > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                <StatBox
                  icon={CalendarIcon}
                  color="text-blue-400"
                  bg="from-blue-500/15 to-blue-700/5"
                  border="border-blue-400/30"
                  value={statsMiesiac.treningi}
                  label="Treningi"
                />
                <StatBox
                  icon={Trophy}
                  color="text-red-400"
                  bg="from-red-500/15 to-red-700/5"
                  border="border-red-400/30"
                  value={statsMiesiac.mecze}
                  label="Mecze"
                />
                <StatBox
                  icon={Flame}
                  color="text-orange-400"
                  bg="from-orange-500/15 to-orange-700/5"
                  border="border-orange-400/30"
                  value={statsMiesiac.sparingi}
                  label="Sparingi"
                />
                <StatBox
                  icon={Target}
                  color="text-purple-400"
                  bg="from-purple-500/15 to-purple-700/5"
                  border="border-purple-400/30"
                  value={statsMiesiac.turnieje}
                  label="Turnieje"
                />
              </div>
            ) : (
              <div className="text-center text-xs text-white/40 py-2">
                Brak wydarzeń w tym miesiącu
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-2xl p-4 mb-4 text-sm animate-fadeIn text-red-200">
              Błąd: {error.message}
            </div>
          )}

          {(!treningi || treningi.length === 0) && <EmptyState />}

          {grupyNadchodzace.length > 0 && (
            <div>
              {grupyNadchodzace.map((g, i) => (
                <Grupa key={g.data} grupa={g} index={i} />
              ))}
            </div>
          )}

          {grupyMinione.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Minione
                </h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="opacity-60">
                {grupyMinione.map((g, i) => (
                  <Grupa key={g.data} grupa={g} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatBox({
  icon: Icon,
  color,
  bg,
  border,
  value,
  label,
}: {
  icon: any;
  color: string;
  bg: string;
  border: string;
  value: number;
  label: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${bg} border ${border} rounded-xl p-2.5 flex flex-col items-center justify-center text-center`}
    >
      <Icon className={`w-4 h-4 ${color} mb-1`} strokeWidth={2.5} />
      <div className="text-xl font-bold text-white leading-none">{value}</div>
      <div className="text-[9px] text-white/60 uppercase tracking-wider font-semibold mt-1">
        {label}
      </div>
    </div>
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
        <h3 className="font-bold text-xl mb-2 text-white drop-shadow">
          Pusty plan
        </h3>
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