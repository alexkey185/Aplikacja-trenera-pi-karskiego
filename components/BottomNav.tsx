'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Calendar } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Kadra', icon: Users },
    { href: '/kalendarz', label: 'Kalendarz', icon: Calendar },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong border-t border-slate-700/50 px-4 pb-2 pt-2 flex justify-around shadow-2xl shadow-black/50">
        {items.map((item) => {
          const aktywny =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 rounded-2xl text-xs transition-all ${
                aktywny
                  ? 'text-green-400'
                  : 'text-slate-500 hover:text-slate-300'
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
              <span className={`relative font-semibold ${aktywny ? '' : 'font-medium'}`}>
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
  );
}