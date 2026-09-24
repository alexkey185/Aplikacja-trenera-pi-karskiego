'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Kadra', icon: '👥' },
    { href: '/kalendarz', label: 'Kalendarz', icon: '📅' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex justify-around md:hidden z-50">
      {items.map((item) => {
        const aktywny =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-2 text-xs transition-colors ${
              aktywny ? 'text-green-400' : 'text-slate-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}