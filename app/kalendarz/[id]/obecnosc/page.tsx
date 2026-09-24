import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ObecnoscForm } from './ObecnoscForm';

export default async function Obecnosc({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum)) notFound();

  const supabase = await createClient();

  const { data: trening, error: errT } = await supabase
    .from('treningi')
    .select('*')
    .eq('id', idNum)
    .single();

  if (errT || !trening) notFound();

  const { data: zawodnicy } = await supabase
    .from('zawodnicy')
    .select('*')
    .order('nazwisko', { ascending: true });

  const { data: obecnosc } = await supabase
    .from('obecnosc')
    .select('*')
    .eq('trening_id', idNum);

  const initialStatus: Record<number, string> = {};
  (obecnosc ?? []).forEach((o) => {
    initialStatus[o.zawodnik_id] = o.status;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 flex items-center gap-4">
          <Link
            href="/kalendarz"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">Obecność</h1>
            <p className="text-sm text-slate-400">
              {new Date(trening.data).toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              })}{' '}
              · {trening.godzina}
            </p>
          </div>
        </header>

        {!zawodnicy || zawodnicy.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-6 text-center text-slate-400">
            Brak zawodników. Dodaj najpierw zawodników w zakładce Kadra.
          </div>
        ) : (
          <ObecnoscForm
            treningId={idNum}
            zawodnicy={zawodnicy}
            initialStatus={initialStatus}
          />
        )}
      </div>
    </main>
  );
}