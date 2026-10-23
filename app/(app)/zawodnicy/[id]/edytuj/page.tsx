import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { EdytujZawodnikForm } from './EdytujZawodnikForm';
import { ArrowLeft, Pencil } from 'lucide-react';

export default async function EdytujZawodnika({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const { data: zawodnik, error } = await supabase
    .from('zawodnicy')
    .select('id, imie, nazwisko, rocznik, pozycja, numer, kontakt_rodzica, notatki')
    .eq('id', idNum)
    .eq('druzyna_id', druzynaId)
    .single();
  if (error || !zawodnik) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-3 animate-fadeIn">
        <Link href={`/zawodnicy/${idNum}`} className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
              <Pencil className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Edytuj zawodnika</h1>
            <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">{zawodnik.imie} {zawodnik.nazwisko}</p>
          </div>
        </div>
      </header>

      <EdytujZawodnikForm zawodnik={zawodnik} />
    </div>
  );
}