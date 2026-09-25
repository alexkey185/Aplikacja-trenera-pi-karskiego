'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    if (!confirm('Na pewno chcesz się wylogować?')) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/40 hover:border-red-400/70 text-red-300 hover:text-red-200 font-bold py-3.5 rounded-2xl transition-all"
    >
      <LogOut className="w-5 h-5" />
      Wyloguj się
    </button>
  );
}