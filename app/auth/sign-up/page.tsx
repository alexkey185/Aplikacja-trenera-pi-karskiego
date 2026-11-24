import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md bg-[#0f172a] border border-[#334155] rounded-3xl p-8 shadow-2xl shadow-black/60">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500/20 border border-green-400/30 mb-4">
          <UserPlus className="w-6 h-6 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Zarejestruj się</h1>
        <p className="text-sm text-[#94a3b8]">Utwórz nowe konto trenera</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Imię i nazwisko
          </label>
          <input 
            type="text" 
            placeholder="Jan Kowalski" 
            className="block w-full bg-[#1e293b] text-white border border-[#334155] rounded-xl px-4 py-3 outline-none focus:border-green-400" 
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            E-mail
          </label>
          <input 
            type="email" 
            placeholder="jan@example.com" 
            className="block w-full bg-[#1e293b] text-white border border-[#334155] rounded-xl px-4 py-3 outline-none focus:border-green-400" 
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Hasło
          </label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="block w-full bg-[#1e293b] text-white border border-[#334155] rounded-xl px-4 py-3 outline-none focus:border-green-400" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all mt-6"
        >
          Utwórz konto
        </button>
      </form>

      <p className="text-center text-sm text-[#94a3b8] mt-6">
        Masz już konto?{' '}
        <Link href="/auth/login" className="text-green-400 hover:text-green-300 font-semibold">
          Zaloguj się
        </Link>
      </p>
    </div>
  );
}