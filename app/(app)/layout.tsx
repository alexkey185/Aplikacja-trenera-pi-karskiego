import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { ToastListener } from '@/components/ToastListener';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';
import { BottomNavSkeleton } from '@/components/BottomNavSkeleton';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { getDzisISO } from '@/lib/dates';

async function BottomNavServer() {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();

  const [userResult, dzisiajResult] = await Promise.all([
    supabase.auth.getUser(),
    druzynaId
      ? supabase
          .from('treningi')
          .select('*', { count: 'exact', head: true })
          .eq('druzyna_id', druzynaId)
          .eq('data', getDzisISO())
      : Promise.resolve({ count: 0, data: null, error: null }),
  ]);

  const user = userResult.data.user;
  const dzisiajCount = dzisiajResult.count ?? 0;

  return (
    <BottomNav
      dzisiajCount={dzisiajCount}
      userEmail={user?.email ?? null}
      userImie={(user?.user_metadata?.imie as string | undefined) ?? null}
      userNazwisko={(user?.user_metadata?.nazwisko as string | undefined) ?? null}
    />
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      <AppBackground priority />

      <div className="app-content relative z-20 px-4 md:px-6 lg:px-8 md:pt-6 lg:pt-8">
        {children}
      </div>

      <Suspense fallback={<BottomNavSkeleton />}>
        <BottomNavServer />
      </Suspense>

      <PWAInstallPrompt />

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3500}
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6)',
          },
        }}
      />
    </main>
  );
}