import { AppBackground } from '@/components/AppBackground';

export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <AppBackground priority />

      <div className="auth-content relative z-20 min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}