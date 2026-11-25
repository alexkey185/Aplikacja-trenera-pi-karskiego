'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, BarChart3, Settings, Trophy, User, Zap
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'GŁÓWNE',
    items: [
      { href: '/dashboard', label: 'Dzisiaj', icon: Zap }, // Ikona pioruna dla "Dzisiaj"
      { href: '/kadra', label: 'Kadra', icon: Users },
    ],
  },
  {
    title: 'TRENING',
    items: [
      { href: '/kalendarz', label: 'Kalendarz', icon: Calendar },
      { href: '/statystyki', label: 'Statystyki', icon: BarChart3 },
    ],
  },
  {
    title: 'KONTO',
    items: [
      { href: '/profil', label: 'Profil', icon: User },
      { href: '/ustawienia', label: 'Ustawienia', icon: Settings },
    ],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 z-30 flex-col bg-[#0f172a] border-r border-[#1e293b]">
        
        {/* Nagłówek z logo (stały rozmiar, nie zwija się) */}
        <div className="p-5 pb-6">
          <Link href="/dashboard" className="flex items-center gap-2 group w-max">
            <span className="text-2xl font-black text-white tracking-tight">
              talent<span className="text-green-500">.</span>
            </span>
          </Link>
        </div>

        {/* Przewijalna nawigacja */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 scrollbar-hide">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-2">
                {group.title}
              </h3>
              <nav className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-white/40'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a] border-t border-[#1e293b] pb-[env(safe-area-inset-bottom)]"
        aria-label="Nawigacja główna"
      >
        <ul className="grid grid-cols-5 list-none m-0 p-0">
          {[
            NAV_GROUPS[0].items[0], // Dzisiaj
            NAV_GROUPS[0].items[1], // Kadra
            NAV_GROUPS[1].items[0], // Kalendarz
            NAV_GROUPS[1].items[1], // Statystyki
            NAV_GROUPS[2].items[0], // Profil
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  className={`flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold transition-colors ${
                    active ? 'text-green-400' : 'text-white/40'
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