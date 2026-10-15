import Link from 'next/link';
import { dodajDruzyna } from './actions';
import { TopBar } from '@/components/TopBar';
import { ArrowLeft, Users, Hash, Palette, Save, Check } from 'lucide-react';

// Wymuś dynamiczne renderowanie - strona używa cookies w TopBar
export const dynamic = 'force-dynamic';

const KOLORY = [
  { value: 'green', bg: 'bg-green-500', ring: 'peer-checked:ring-green-400' },
  { value: 'blue', bg: 'bg-blue-500', ring: 'peer-checked:ring-blue-400' },
  { value: 'purple', bg: 'bg-purple-500', ring: 'peer-checked:ring-purple-400' },
  { value: 'orange', bg: 'bg-orange-500', ring: 'peer-checked:ring-orange-400' },
  { value: 'red', bg: 'bg-red-500', ring: 'peer-checked:ring-red-400' },
  { value: 'yellow', bg: 'bg-yellow-500', ring: 'peer-checked:ring-yellow-400' },
  { value: 'pink', bg: 'bg-pink-500', ring: 'peer-checked:ring-pink-400' },
  { value: 'slate', bg: 'bg-slate-500', ring: 'peer-checked:ring-slate-400' },
];

export default function NowaDruzyna() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-3 animate-fadeIn">
        <Link href="/druzyny" className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Nowa drużyna</h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">Nazwa, rocznik i kolor</p>
          </div>
        </div>
        <TopBar />
      </header>

      <form action={dodajDruzyna} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60">
        <label className="block group">
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-3.5 h-3.5 text-white/50 group-focus-within:text-green-400 transition-colors" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Nazwa drużyny <span className="text-green-400 ml-1">*</span>
            </span>
          </div>
          <div className="bg-white/5 border border-white/15 focus-within:border-green-400/60 focus-within:bg-white/10 rounded-xl px-3 transition-all">
            <input name="nazwa" type="text" required maxLength={80} placeholder="np. Orły 2012" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
          </div>
        </label>

        <label className="block group">
          <div className="flex items-center gap-2 mb-1.5">
            <Hash className="w-3.5 h-3.5 text-white/50 group-focus-within:text-green-400 transition-colors" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Rocznik</span>
          </div>
          <div className="bg-white/5 border border-white/15 focus-within:border-green-400/60 focus-within:bg-white/10 rounded-xl px-3 transition-all">
            <input name="rocznik" type="number" min={1900} max={2100} placeholder="np. 2012" className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2" />
          </div>
        </label>

        <fieldset>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Kolor drużyny</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {KOLORY.map((k, i) => (
              <label key={k.value} className="cursor-pointer" title={k.value}>
                <input type="radio" name="kolor" value={k.value} defaultChecked={i === 0} className="peer sr-only" />
                <div className={`relative w-10 h-10 rounded-xl ${k.bg} transition-all peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-slate-900 ${k.ring} hover:scale-105 flex items-center justify-center`}>
                  <Check className="w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                </div>
              </label>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-2">Kolor pojawi się jako odznaka drużyny w przełączniku.</p>
        </fieldset>

        <button type="submit" className="group w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5">
          <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Utwórz drużynę
        </button>
      </form>
    </div>
  );
}