'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Calendar,
  BarChart3,
  Zap,
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
      { href: '/dashboard', label: 'Dzisiaj', icon: Zap },
      { href: '/kadra', label: 'Kadra', icon: Users },
    ] as Item[],
  },
  {
    nazwa: 'Trening',
    items: [
      { href: '/kalendarz', label: 'Kalendarz', icon: Calendar },
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

// Ścieżki publiczne — bez sidebara i bottom nav
const HIDDEN_PATHS = ['/', '/auth', '/prywatnosc', '/regulamin'];

function shouldHideNav(pathname: string): boolean {
  return HIDDEN_PATHS.some((path) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  });
}

export function BottomNav({
  dzisiajCount,
  userEmail,
  userImie,
  userNazwisko,
}: {
  dzisiajCount: number;
  userEmail: string | null;
  userImie: string | null;
  userNazwisko: string | null;
}) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const hidden = shouldHideNav(pathname);

  async function handleLogout() {
    setLogoutLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();

    // ═══════════════════════════════════════════════════════
    // HARD REDIRECT — pełne przeładowanie strony.
    //
    // Dlaczego nie router.push + router.refresh:
    //   - router.push nie zabija stanu komponentów klienta
    //   - router.refresh re-renderuje server components, ale klient
    //     trzyma stary stan (np. logoutLoading = true, otwarty modal)
    //
    // window.location.href robi hard reload — wszystkie stany czyszczone.
    // ═══════════════════════════════════════════════════════
    window.location.href = '/auth/login';
  }

  if (hidden) {
    return null;
  }

  const pelneImie =
    userImie && userNazwisko ? `${userImie} ${userNazwisko}` : null;
  const inicjal = (userImie?.charAt(0) || userEmail?.charAt(0) || '?').toUpperCase();
  const wszystkieItems = sekcje.flatMap((s) => s.items);

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-50 bg-slate-900/95 backdrop-blur-xl border-r border-white/10">
        {/* Logo — przezroczysty wordmark */}
        <div className="p-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/wordmark-transparent-400.png"
              alt="Talent"
              className="h-9 w-auto"
              style={{ mixBlendMode: 'lighten' }}
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
                  const aktywny =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard' ||
                        pathname.startsWith('/dashboard/')
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  const showBadge =
                    item.href === '/dashboard' && dzisiajCount > 0;
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
                      <Icon
                        className="w-5 h-5 flex-shrink-0"
                        strokeWidth={aktywny ? 2.5 : 2}
                      />
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
                {pelneImie ?? userEmail ?? '...'}
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-2 pb-2 pt-2 flex justify-around shadow-2xl shadow-black/50">
          {wszystkieItems.map((item) => {
            const aktywny =
              item.href === '/dashboard'
                ? pathname === '/dashboard' ||
                  pathname.startsWith('/dashboard/')
                : pathname.startsWith(item.href);
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