'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
      className="text-slate-400 hover:text-white text-sm px-3 py-2 border border-slate-700 rounded-lg transition-colors"
    >
      Wyloguj
    </button>
  );
}