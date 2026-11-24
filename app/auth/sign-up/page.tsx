import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Zarejestruj się</h1>
        <p className="text-sm text-slate-400">Utwórz nowe konto trenera</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Imię i nazwisko
          </label>
          <input 
            type="text" 
            placeholder="Jan Kowalski" 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400" 
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            E-mail
          </label>
          <input 
            type="email" 
            placeholder="jan@example.com" 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400" 
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Hasło
          </label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all mt-6"
        >
          Utwórz konto
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6">
        Masz już konto?{' '}
        <Link href="/auth/login" className="text-green-400 hover:text-green-300 font-semibold">
          Zaloguj się
        </Link>
      </p>
    </div>
  );
}