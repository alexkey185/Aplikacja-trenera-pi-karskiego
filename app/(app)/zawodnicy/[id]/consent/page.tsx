import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { ConsentForm } from './ConsentForm';
import Link from 'next/link';
import { ArrowLeft, FileCheck2 } from 'lucide-react';

export default async function ZawodnikConsentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) redirect('/druzyny/nowa');

  const { data: zawodnik, error: errZ } = await supabase
    .from('zawodnicy')
    .select('id, imie, nazwisko, has_consent')
    .eq('id', idNum)
    .eq('druzyna_id', druzynaId)
    .single();
  if (errZ || !zawodnik) notFound();

  const { data: consents } = await supabase
    .from('zawodnik_consents')
    .select('*')
    .eq('zawodnik_id', idNum);

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <Link href={`/zawodnicy/${idNum}`} className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white drop-shadow-lg">Zgoda rodzica</h1>
          <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
            {zawodnik.imie} {zawodnik.nazwisko}
          </p>
        </div>
      </header>

      {zawodnik.has_consent ? (
        <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-4 mb-4 text-green-200 text-sm">
          <FileCheck2 className="w-4 h-4 inline mr-2" />
          Zgoda rodzica/opiekuna jest zarejestrowana.
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 mb-4 text-amber-200 text-sm">
          Brak zgody rodzica. Zgodnie z polityką prywatności, trener zobowiązany jest uzyskać zgodę przed wpisaniem danych dziecka.
        </div>
      )}

      <ConsentForm zawodnikId={idNum} druzynaId={druzynaId} existingConsents={consents ?? []} />
    </div>
  );
}