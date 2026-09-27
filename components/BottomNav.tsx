'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Calendar,
  BarChart3,
  LayoutDashboard,
  User,
} from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Kalendarz', icon: LayoutDashboard },
  { href: '/kadra', label: 'Kadra', icon: Users },
  { href: '/kalendarz', label: 'Plan', icon: Calendar },
  { href: '/statystyki', label: 'Statystyki', icon: BarChart3 },
  { href: '/profil', label: 'Profil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/' || pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <>
      {/* SIDEBAR — tylko na desktopie */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-50 bg-slate-900/95 backdrop-blur-xl border-r border-white/10">
        <div className="p-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg leading-none">
                T
              </span>
            </div>
            <div>
              <div className="text-lg font-black text-white tracking-tight leading-none">
                talent<span className="text-green-400">.</span>
              </div>
              <div className="text-[10px] text-white/50 font-medium mt-0.5">
                Aplikacja trenera
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const aktywny = pathname.startsWith(item.href);
            const Icon = item.icon;
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
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* DOLNA NAWIGACJA — tylko na mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-2 pb-2 pt-2 flex justify-around shadow-2xl shadow-black/50">
          {items.map((item) => {
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
    </>
  );
}