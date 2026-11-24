import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="glass border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 mb-4">
          <LogIn className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Zaloguj się</h1>
        <p className="text-sm text-white/60">Wróć do zarządzania drużyną</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            E-mail
          </label>
          <input 
            type="email" 
            placeholder="jan@example.com" 
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-400/50 transition-colors" 
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Hasło
          </label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-400/50 transition-colors" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-all mt-4"
        >
          Zaloguj się
        </button>
      </form>

      <p className="text-center text-sm text-white/50 mt-6">
        Nie masz konta?{' '}
        <Link href="/auth/sign-up" className="text-blue-400 hover:text-blue-300 font-semibold">
          Zarejestruj się
        </Link>
      </p>
    </div>
  );
}