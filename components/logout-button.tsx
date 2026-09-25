'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm px-3 py-2 bg-white/70 hover:bg-white border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow"
    >
      <LogOut className="w-4 h-4" />
      Wyloguj
    </button>
  );
}