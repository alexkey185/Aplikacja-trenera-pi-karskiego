import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { ForgotPasswordForm } from '@/components/forgot-password-form';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  noStore();

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* TŁO MOBILE */}
      <div className="absolute inset-0 z-0 md:hidden">
        <Image
          src="/talent-hero-mobile.png"
          alt=""
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>

      {/* TŁO DESKTOP */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <Image
          src="/talent-hero.png"
          alt=""
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>

      {/* Przygaszenie */}
      <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm" />

      {/* BACK */}
      <Link
        href="/auth/login"
        className="absolute top-6 left-6 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* TREŚĆ */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 py-10">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-white mb-2 animate-fadeIn leading-none drop-shadow-2xl">
          talent
          <span className="text-green-500">.</span>
        </h1>

        <p className="text-white/80 text-center text-sm mb-10 animate-fadeIn font-medium drop-shadow">
          Twój zespół, Twoje zasady
        </p>

        <div className="w-full max-w-sm animate-fadeIn">
          <ForgotPasswordForm />
        </div>

        <p className="text-center text-xs text-white/60 mt-8 drop-shadow">
          Wersja 1.0
        </p>
      </div>
    </main>
  );
}