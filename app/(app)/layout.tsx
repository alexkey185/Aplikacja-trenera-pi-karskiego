import Image from 'next/image';
import { Suspense } from 'react';
import { ToastListener } from '@/components/ToastListener';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

// ═══════════════════════════════════════════════════════════════
// force-dynamic usunięte.
//
// Layout nie fetchuje danych - tylko renderuje shell + Suspense.
// Dynamiczne fragmenty (TopBar, BottomNav) i tak wymuszają
// dynamic mode przez cookies(), więc każda strona pod tym
// layoutem pozostaje dynamic. Ale Next może teraz streamować
// shell zanim dane się załadują.
//
// Jeśli widzisz dziwne błędy hydratacji - przywróć `force-dynamic`.
// ═══════════════════════════════════════════════════════════════

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.webp"
          alt=""
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>

      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src="/talent-bg.webp"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>

      <div className="fixed inset-0 z-10 bg-slate-950/70 md:backdrop-blur-sm" />

      <div className="app-content relative z-20 px-4 md:px-6 lg:px-8 pb-28 md:pt-6 lg:pt-8">
        {children}
      </div>

      <PWAInstallPrompt />
    </main>
  );
}