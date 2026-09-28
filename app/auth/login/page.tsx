import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { ArrowLeft } from 'lucide-react';

export default async function LoginPage() {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden text-slate-400 pt-0"
      style={{
        background:
          'radial-gradient(ellipse 55% 40% at 50% 44%, rgba(34,197,94,.07) 0%, rgba(34,197,94,0) 100%), radial-gradient(ellipse 75% 60% at 50% 44%, #0f172a 0%, #0a0e1a 75%)',
        backgroundColor: '#0a0e1a',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Back */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Treść */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 py-10">
        <img
          src="/wordmark-transparent-400.png"
          alt="Talent"
          className="w-56 h-auto mb-4 animate-fadeIn"
        />

        <p className="text-white/80 text-center text-sm mb-10 animate-fadeIn font-medium">
          Twój zespół, Twoje zasady
        </p>

        <div className="w-full max-w-sm animate-fadeIn">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-white/50 mt-8">
          Wersja 1.0
        </p>
      </div>
    </main>
  );
}