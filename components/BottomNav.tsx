'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Calendar, BarChart3 } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/' || pathname.startsWith('/auth')) {
    return null;
  }

  const items = [
    { href: '/kadra', label: 'Kadra', icon: Users },
    { href: '/kalendarz', label: 'Kalendarz', icon: Calendar },
    { href: '/statystyki', label: 'Statystyki', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 pb-2 pt-2 flex justify-around shadow-2xl shadow-slate-900/10">
        {items.map((item) => {
          const aktywny = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 rounded-2xl text-xs transition-all ${
                aktywny
                  ? 'text-green-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {aktywny && (
                <div className="absolute inset-0 bg-green-500/10 rounded-2xl" />
              )}
              <Icon
                className={`relative w-5 h-5 mb-1 transition-transform ${
                  aktywny ? 'scale-110' : ''
                }`}
                strokeWidth={aktywny ? 2.5 : 2}
              />
              <span
                className={`relative font-semibold ${
                  aktywny ? '' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {aktywny && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}