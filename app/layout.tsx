import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#020617]">
      <AppBackground />
      <BottomNav />
      
      {/* 
        md:pl-64 - robi miejsce na boczne menu na komputerze
        pb-20 - robi miejsce na dolne menu na telefonie (16 = 4rem, dajemy 20 = 5rem dla bezpieczeństwa)
      */}
      <main className="relative z-10 md:pl-64 pb-20 md:pb-0 w-full min-h-screen">
        <div className="p-4 md:p-6 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}