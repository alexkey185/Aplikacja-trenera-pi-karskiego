import { Settings, User } from 'lucide-react';

export default function UstawieniaPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <div className="relative flex-shrink-0">
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Ustawienia</h1>
          <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
            Zarządzaj kontem i preferencjami
          </p>
        </div>
      </header>

      <div className="glass border border-white/10 rounded-3xl p-6 md:p-8 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Strona w budowie</h2>
        <p className="text-sm text-white/60 max-w-md mx-auto">
          Tutaj pojawią się ustawienia profilu, zarządzanie subskrypcją oraz opcje usunięcia konta.
        </p>
      </div>
    </div>
  );
}