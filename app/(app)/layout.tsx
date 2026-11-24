// app/(app)/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, BarChart3, Settings, Trophy } from 'lucide-react';

const MENU_ITEMS = [
  { href: '/dashboard', label: 'Pulpit', icon: LayoutDashboard },
  { href: '/kalendarz', label: 'Kalendarz', icon: Calendar },
  { href: '/kadra', label: 'Kadra', icon: Users },
  { href: '/sezon', label: 'Sezon', icon: Trophy },
  { href: '/statystyki', label: 'Statystyki', icon: BarChart3 },
  { href: '/ustawienia', label: 'Ustawienia', icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* MENU BOCZNE */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-slate-900/50 backdrop-blur-md hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-wider text-green-400">TALENT</h2>
        </div>
        
        <nav className="flex-1 space-y-1 px-3">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-green-500/15 text-green-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* GŁÓWNA ZAWARTOŚĆ */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}