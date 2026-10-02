import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UpdatePasswordForm } from '@/components/update-password-form';
import { ArrowLeft } from 'lucide-react';

export default async function UpdatePasswordPage() {
  const supabase = await createClient();

  // ═══════════════════════════════════════════════════════
  // GUARD: dostęp tylko dla zalogowanego (sesja recovery z maila)
  //
  // Sesja recovery jest tworzona przez /auth/confirm gdy
  // user kliknie link z maila „reset hasła". Bez tej sesji
  // nie ma jak zmienić hasła — trzeba się zalogować.
  // ═══════════════════════════════════════════════════════
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Tło */}
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.webp"
          alt=""
          fill
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
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      {/* Back button */}
      <Link
        href="/profil"
        className="absolute top-6 left-6 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Content */}
      <div className="relative z-20 min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <UpdatePasswordForm />
        </div>
      </div>
    </main>
  );
}