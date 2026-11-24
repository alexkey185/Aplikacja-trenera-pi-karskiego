import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaIdFast } from '@/lib/druzyny';
import { EdytujForm } from './EdytujForm';
import { ArrowLeft, Pencil } from 'lucide-react';

export default async function EdytujTreningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const treningId = Number(id);
  if (!Number.isInteger(treningId) || treningId <= 0) notFound();

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaIdFast();
  if (!druzynaId) redirect('/druzyny/nowa');

  const { data: trening, error } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, miejsce, notatki, cykl_id, is_home, wynik_gospodarzy, wynik_gosci')
    .eq('id', treningId)
    .eq('druzyna_id', druzynaId)
    .maybeSingle();

  if (error || !trening) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-3 animate-fadeIn">
        <Link href={`/kalendarz/${trening.id}/obecnosc`} className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
              <Pencil className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">
              Edytuj wydarzenie
            </h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 truncate drop-shadow">
              {new Date(trening.data + 'T00:00:00').toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' })} · {trening.godzina} · {trening.typ}
            </p>
          </div>
        </div>
      </header>

      <EdytujForm trening={trening} />
    </div>
  );
}