import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { TopBar } from '@/components/TopBar';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { Trophy } from 'lucide-react';
import { SezonClient, type MeczSezon } from './SezonClient';

export default async function SezonPage() {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  
  if (!druzynaId) redirect('/druzyny/nowa');

  // Pobieramy TYLKO mecze i sparingi, posortowane od najnowszych
  const { data: mecze } = await supabase
    .from('treningi')
    .select('id, data, godzina, typ, przeciwnik, is_home, wynik_gospodarzy, wynik_gosci')
    .eq('druzyna_id', druzynaId)
    .in('typ', ['mecz', 'sparing'])
    .order('data', { ascending: false })
    .order('godzina', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <PageHeaderLogo icon={Trophy} logoUrl={null} color="purple" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">Sezon</h1>
          <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
            Wszystkie mecze i sparingi
          </p>
        </div>
        <TopBar />
      </header>

      <SezonClient mecze={(mecze ?? []) as MeczSezon[]} />
    </div>
  );
}