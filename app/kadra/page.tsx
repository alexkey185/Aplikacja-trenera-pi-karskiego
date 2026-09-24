import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/LogoutButton';
import {
  Users,
  Calendar,
  Plus,
  ChevronRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export default async function Kadra() {
  noStore();
  const supabase = await createClient();
  const { data: zawodnicy, error } = await supabase
    .from('zawodnicy')
    .select('*')
    .order('nazwisko', { ascending: true });

  const liczba = zawodnicy?.length ?? 0;

  return (
    <main className="min-h-screen text-white p-4 md:p-6 pb-28">
      <div className="max-w-2xl mx-auto">
        {/* HERO */}
        <header className="mb-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-2xl">
                  <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Talent
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {liczba} {liczba === 1 ? 'zawodnik' : 'zawodników'}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              href="/kalendarz"
              className="group flex items-center gap-2 glass hover:glass-strong text-white font-medium px-4 py-3 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              Kalendarz
            </Link>
            <Link
              href="/statystyki"
              className="group flex items-center gap-2 glass hover:glass-strong text-white font-medium px-4 py-3 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-purple-900/30 hover:-translate-y-0.5"
            >
              <BarChart3 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              Statystyki
            </Link>
            <Link
              href="/zawodnicy/nowy"
              className="group flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-semibold px-4 py-3 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-green-900/50 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Dodaj zawodnika
            </Link>
          </div>
        </header>

        {error && (
          <div className="glass border-red-500/30 rounded-2xl p-4 mb-4 text-sm animate-fadeIn text-red-300">
            Błąd: {error.message}
          </div>
        )}

        {liczba === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Skład drużyny
              </h2>
            </div>
            <ul className="space-y-2">
              {zawodnicy!.map((z: any, i: number) => (
                <li
                  key={z.id}
                  className={`group glass rounded-2xl overflow-hidden hover:bg-slate-800/70 transition-all hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-0.5 animate-fadeIn stagger-${Math.min(
                    i + 1,
                    8
                  )}`}
                >
                  <Link
                    href={`/zawodnicy/${z.id}`}
                    className="flex items-center gap-4 p-4"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                        {z.numer ?? '—'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-white">
                        {z.imie} {z.nazwisko}
                      </div>
                      <div className="text-sm text-slate-400 truncate flex items-center gap-2">
                        <span>{z.pozycja ?? 'Brak pozycji'}</span>
                        {z.rocznik && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span>{z.rocznik}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-3xl p-12 text-center animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto mb-5 shadow-2xl animate-glow">
          <Users className="w-10 h-10 text-green-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-bold text-xl mb-2">Zacznijmy od składu</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
          Dodaj pierwszego zawodnika, żeby zarządzać drużyną, treningami i
          frekwencją.
        </p>
        <Link
          href="/zawodnicy/nowy"
          className="group inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-green-900/50 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Dodaj pierwszego zawodnika
        </Link>
      </div>
    </div>
  );
}