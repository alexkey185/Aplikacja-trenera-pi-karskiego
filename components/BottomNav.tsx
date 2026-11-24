'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, BarChart3, Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Pulpit', icon: LayoutDashboard },
  { href: '/kalendarz', label: 'Kalendarz', icon: Calendar },
  { href: '/kadra', label: 'Kadra', icon: Users },
  { href: '/statystyki', label: 'Statystyki', icon: BarChart3 },
  { href: '/ustawienia', label: 'Ustawienia', icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 z-30 flex-col glass border-r border-white/10 p-5">
        <Link href="/dashboard" className="block mb-8" aria-label="Pulpit" prefetch>
          <div className="wordmark-desktop" aria-hidden="true" />
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-green-500/15 text-green-300 border border-green-400/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
        aria-label="Nawigacja główna"
      >
        <ul className="grid grid-cols-5 list-none m-0 p-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                    active ? 'text-green-400' : 'text-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}