import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TopBar } from '@/components/TopBar';
import { EdytujDruzynaForm } from './EdytujDruzynaForm';
import { ArrowLeft, Pencil } from 'lucide-react';

export default async function EdytujDruzyna({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) notFound();

  const supabase = await createClient();
  const { data: druzyna, error } = await supabase
    .from('druzyny')
    .select('id, nazwa, rocznik, kolor')
    .eq('id', id)
    .single();

  if (error || !druzyna) notFound();

  const { count: liczbaZawodnikow } = await supabase
    .from('zawodnicy')
    .select('id', { count: 'exact', head: true })
    .eq('druzyna_id', id);

  const { count: liczbaTreningow } = await supabase
    .from('treningi')
    .select('id', { count: 'exact', head: true })
    .eq('druzyna_id', id);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.webp"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src="/talent-bg.webp"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 flex items-center gap-3 animate-fadeIn">
            <Link
              href="/druzyny"
              className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                  <Pencil className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">
                  Edytuj drużynę
                </h1>
                <p className="text-xs text-white/70 font-medium mt-0.5 truncate drop-shadow">
                  {druzyna.nazwa}
                </p>
              </div>
            </div>
            <TopBar />
          </header>

          <EdytujDruzynaForm
            druzyna={druzyna}
            liczbaZawodnikow={liczbaZawodnikow ?? 0}
            liczbaTreningow={liczbaTreningow ?? 0}
          />
        </div>
      </div>
    </main>
  );
}