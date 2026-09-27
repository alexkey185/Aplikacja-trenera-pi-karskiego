import Image from 'next/image';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/LogoutButton';
import {
  User,
  Mail,
  Calendar as CalendarIcon,
  Shield,
  Info,
  ChevronRight,
} from 'lucide-react';

export default async function Profil() {
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const email = user.email ?? 'brak';
  const inicjal = email.charAt(0).toUpperCase();
  const dataUtworzenia = user.created_at
    ? new Date(user.created_at).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';
  const ostatnieLogowanie = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.png"
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
          src="/talent-bg.png"
          alt=""
          fill
          
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6 animate-fadeIn">
            <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
              Profil
            </h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
              Twoje konto i ustawienia
            </p>
          </header>

          {/* Karta użytkownika */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4 animate-fadeIn shadow-2xl shadow-black/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-full blur-lg opacity-60" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center font-bold text-white text-3xl shadow-2xl">
                  {inicjal}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">
                  Zalogowany jako
                </div>
                <div className="font-bold text-white text-lg truncate drop-shadow">
                  {email}
                </div>
                <div className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-green-400" />
                  Konto trenera
                </div>
              </div>
            </div>
          </div>

          {/* Informacje o koncie */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden mb-4 animate-fadeIn shadow-2xl shadow-black/60">
            <div className="p-5 border-b border-white/10">
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Informacje
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                      Email
                    </div>
                    <div className="text-sm text-white truncate">{email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                      Konto utworzone
                    </div>
                    <div className="text-sm text-white truncate">
                      {dataUtworzenia}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 text-green-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                      Ostatnie logowanie
                    </div>
                    <div className="text-sm text-white truncate">
                      {ostatnieLogowanie}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info o aplikacji */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden mb-6 animate-fadeIn shadow-2xl shadow-black/60">
            <div className="p-5">
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Aplikacja
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-white/70">Nazwa</span>
                <span className="text-sm font-semibold text-white">Talent</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-white/70">Wersja</span>
                <span className="text-sm font-semibold text-white">1.0</span>
              </div>
            </div>
          </div>

          {/* Wyloguj */}
          <div className="animate-fadeIn">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}