import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden">
      <AppBackground />
      <BottomNav />
      {/* Używamy w-full i overflow-x-hidden, aby zapobiec rozjeżdżaniu na mobile */}
      <main className="relative z-10 md:pl-64 pb-24 md:pb-0 w-full max-w-full min-h-screen overflow-x-hidden">
        <div className="p-3 md:p-6 h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}