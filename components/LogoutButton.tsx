'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/40 hover:border-red-400/70 text-red-300 hover:text-red-200 font-bold py-3.5 rounded-2xl transition-all"
      >
        <LogOut className="w-5 h-5" />
        Wyloguj się
      </button>

      <ConfirmDialog
        open={open}
        title="Wylogować się?"
        message="Zakończysz sesję i wrócisz do ekranu logowania. Będziesz musiał zalogować się ponownie."
        confirmLabel="Wyloguj"
        variant="warning"
        loading={loading}
        icon={<LogOut className="w-7 h-7" />}
        onCancel={() => setOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}