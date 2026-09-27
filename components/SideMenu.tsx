'use client';

import Link from 'next/link';

export default function SideMenu() {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-50 bg-slate-900/95 border-r border-white/10">
      <div className="p-5 border-b border-white/10">
        <Link href="/dashboard" className="text-white text-lg font-bold">
          Talent
        </Link>
      </div>
      <nav className="p-3 space-y-1">
        <Link
          href="/dashboard"
          className="block px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm"
        >
          Kalendarz
        </Link>
        <Link
          href="/kadra"
          className="block px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm"
        >
          Kadra
        </Link>
        <Link
          href="/kalendarz"
          className="block px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm"
        >
          Plan
        </Link>
        <Link
          href="/statystyki"
          className="block px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm"
        >
          Statystyki
        </Link>
        <Link
          href="/profil"
          className="block px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm"
        >
          Profil
        </Link>
      </nav>
    </aside>
  );
}