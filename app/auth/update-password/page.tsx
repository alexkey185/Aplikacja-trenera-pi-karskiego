import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UpdatePasswordForm } from '@/components/update-password-form';
import { ArrowLeft } from 'lucide-react';

export default async function UpdatePasswordPage() {
  const supabase = await createClient();

  // Guard: dostęp tylko dla zalogowanego (sesja recovery)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <>
      <Link
        href="/profil"
        className="fixed top-6 left-6 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Powrót do profilu"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <UpdatePasswordForm />
    </>
  );
}