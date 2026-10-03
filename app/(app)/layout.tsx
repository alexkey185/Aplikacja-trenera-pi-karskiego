import Image from 'next/image';
import { Suspense } from 'react';
import { ToastListener } from '@/components/ToastListener';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      {/* Tło — mobile
          priority: preload w <head> + eager loading.
          Mobile dominuje w tej apce → priorytet dla LCP na telefonach.
          Desktop wersja poniżej NIE ma priority (loading lazy) —
          przedładowanie obu = marnowanie pasma na niewidocznym obrazie. */}
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

      {/* Tło — desktop (loading lazy — IO odpala się od razu na desktopie) */}
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

      {/* Overlay + blur — blur tylko na desktopie */}
      <div className="fixed inset-0 z-10 bg-slate-950/70 md:backdrop-blur-sm" />

      {/* Zawartość */}
      <div className="relative z-20 p-4 md:p-6 lg:p-8 pb-28">{children}</div>
    </main>
  );
}