'use client';

import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const handleLogout = async () => {
    const ok = window.confirm('Wylogować się?');
    if (!ok) return;

    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/60 text-red-300 hover:text-red-200 font-semibold py-3.5 rounded-2xl text-sm transition-all"
    >
      <LogOut className="w-4 h-4" />
      Wyloguj się
    </button>
  );
}