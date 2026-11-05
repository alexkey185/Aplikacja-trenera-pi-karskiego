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
import { redirect } from 'next/navigation';

async function BottomNavServer() {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();

  const [sessionResult, dzisiajResult] = await Promise.all([
    supabase.auth.getSession(),
    druzynaId
      ? supabase
          .from('treningi')
          .select('id', { count: 'exact', head: true })
          .eq('druzyna_id', druzynaId)
          .eq('data', getDzisISO())
      : Promise.resolve({ count: 0, data: null, error: null }),
  ]);

  const user = sessionResult.data.session?.user;
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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isDemo = session?.user?.email === 'test@test.pl';

  // SERVER ACTION: Prawdziwe wylogowanie z demo
  async function handleExitDemo() {
    'use server';
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect('/auth/login');
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      
      {isDemo && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-orange-500 to-red-600 text-white text-center py-1.5 px-4 text-xs font-bold shadow-lg flex items-center justify-center gap-2">
          <span>To jest wersja DEMO. Możesz klikać i testować bez ograniczeń.</span>
          <form action={handleExitDemo} className="inline m-0 p-0">
            <button type="submit" className="underline hover:text-white/80 ml-2 font-bold cursor-pointer">
              Wyjdź z Demo
            </button>
          </form>
        </div>
      )}

      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      <AppBackground priority />

      <div className={`app-content relative z-20 px-4 md:px-6 lg:px-8 md:pt-6 lg:pt-8 ${isDemo ? 'pt-12 md:pt-14' : ''}`}>
        {children}
      </div>

      <Suspense fallback={<BottomNavSkeleton />}>
        <BottomNavServer />
      </Suspense>

      <PWAInstallPrompt />
      <Toaster position="top-right" richColors closeButton duration={3500} toastOptions={{ style: { background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', backdropFilter: 'blur(16px)', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6)' } }} />
    </main>
  );
}