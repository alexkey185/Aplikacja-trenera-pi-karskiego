'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Calendar,
  BarChart3,
  LayoutDashboard,
  User,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const sekcje = [
  {
    nazwa: 'Główne',
    items: [
      { href: '/dashboard', label: 'Kalendarz', icon: LayoutDashboard },
      { href: '/kadra', label: 'Kadra', icon: Users },
    ] as Item[],
  },
  {
    nazwa: 'Trening',
    items: [
      { href: '/kalendarz', label: 'Plan', icon: Calendar },
      { href: '/statystyki', label: 'Statystyki', icon: BarChart3 },
    ] as Item[],
  },
  {
    nazwa: 'Konto',
    items: [
      { href: '/profil', label: 'Profil', icon: User },
    ] as Item[],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [imie, setImie] = useState<string | null>(null);
  const [nazwisko, setNazwisko] = useState<string | null>(null);
  const [dzisiajCount, setDzisiajCount] = useState<number>(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setEmail(u?.email ?? null);
      setImie(u?.user_metadata?.imie ?? null);
      setNazwisko(u?.user_metadata?.nazwisko ?? null);
    });
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    const dzis = new Date().toISOString().split('T')[0];
    supabase
      .from('treningi')
      .select('id')
      .eq('data', dzis)
      .then(({ data }) => {
        setDzisiajCount(data?.length ?? 0);
      });
  }, [pathname]);

  async function handleLogout() {
    setLogoutLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  if (pathname === '/' || pathname.startsWith('/auth')) {
    return null;
  }

  const pelneImie = imie && nazwisko ? `${imie} ${nazwisko}` : null;
  const inicjal = (imie?.charAt(0) || email?.charAt(0) || '?').toUpperCase();
  const wszystkieItems = sekcje.flatMap((s) => s.items);

  return (
    <>
      {/* SIDEBAR — desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-50 bg-slate-900/95 backdrop-blur-xl border-r border-white/10">
        <div className="p-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/wordmark-on-dark.png"
              alt="Talent"
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {sekcje.map((sekcja, sIdx) => (
            <div key={sekcja.nazwa} className={sIdx > 0 ? 'mt-4' : ''}>
              <div className="text-[10px] text-white/35 uppercase tracking-widest font-bold px-3 py-2">
                {sekcja.nazwa}
              </div>
              <div className="space-y-1">
                {sekcja.items.map((item) => {
                  const aktywny = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  const showBadge = item.href === '/dashboard' && dzisiajCount > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        aktywny
                          ? 'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-green-500/15 text-green-300 font-semibold'
                          : 'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5'
                      }
                    >
                      {aktywny && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-full" />
                      )}
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={aktywny ? 2.5 : 2} />
                      <span className="flex-1">{item.label}</span>
                      {showBadge && (
                        <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                          {dzisiajCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link
            href="/profil"
            className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 mb-2 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              {inicjal}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                Zalogowany
              </div>
              <div className="text-xs text-white truncate">
                {pelneImie ?? email ?? '...'}
              </div>
            </div>
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/60 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Wyloguj
          </button>
        </div>
      </aside>

      {/* DOLNA NAWIGACJA — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-2 pb-2 pt-2 flex justify-around shadow-2xl shadow-black/50">
          {wszystkieItems.map((item) => {
            const aktywny = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center flex-1 py-2 rounded-2xl text-[10px] transition-all ${
                  aktywny
                    ? 'text-green-400'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {aktywny && (
                  <div className="absolute inset-0 bg-green-500/15 rounded-2xl" />
                )}
                <Icon
                  className={`relative w-5 h-5 mb-0.5 transition-transform ${
                    aktywny ? 'scale-110' : ''
                  }`}
                  strokeWidth={aktywny ? 2.5 : 2}
                />
                <span
                  className={`relative ${
                    aktywny ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
                {aktywny && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* MODAL WYLOGOWANIA */}
      <ConfirmDialog
        open={showLogoutModal}
        title="Wylogować się?"
        message="Zakończysz sesję i wrócisz do ekranu logowania."
        confirmLabel="Wyloguj"
        variant="warning"
        loading={logoutLoading}
        icon={<LogOut className="w-7 h-7" />}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}