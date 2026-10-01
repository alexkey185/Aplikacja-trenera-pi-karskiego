import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { NowyTreningForm } from './NowyTreningForm';
import { ArrowLeft, Plus } from 'lucide-react';

export default async function NowyTrening({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  noStore();
  const params = await searchParams;
  const defaultData = params.data && /^\d{4}-\d{2}-\d{2}$/.test(params.data)
    ? params.data
    : undefined;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-3 animate-fadeIn">
        <Link href="/kalendarz" className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Nowe wydarzenie</h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">Trening, mecz, sparing lub turniej</p>
          </div>
        </div>
      </header>

      <NowyTreningForm defaultData={defaultData} />
    </div>
  );
}