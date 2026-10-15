import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { ArrowLeft } from 'lucide-react';

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <Link
        href="/"
        className="fixed top-6 left-6 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Powrót do strony głównej"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <LoginForm />
    </>
  );
}