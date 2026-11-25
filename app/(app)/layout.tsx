import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col">
      <AppBackground />
      <BottomNav />

      {/* 
        md:pl-64 - tylko na desktopie robi miejsce na menu boczne.
        pb-24 - na telefonie robi miejsce na dolny pasek, żeby nie zasłaniał treści.
        w-full - wymusza pełną szerokość.
      */}
      <main className="relative z-10 w-full flex-1 md:pl-64 pb-24 md:pb-0">
        <div className="w-full p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}