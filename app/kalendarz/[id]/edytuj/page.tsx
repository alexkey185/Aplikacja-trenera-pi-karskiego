import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { aktualizujTrening } from './actions';
import { DeleteButton } from './DeleteButton';

export default async function EdytujTrening({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum)) notFound();

  const supabase = await createClient();
  const { data: trening, error } = await supabase
    .from('treningi')
    .select('*')
    .eq('id', idNum)
    .single();

  if (error || !trening) notFound();

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Link
            href="/kalendarz"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ←
          </Link>
          <h1 className="text-2xl font-bold">Edytuj wydarzenie</h1>
        </header>

        <form
          action={aktualizujTrening.bind(null, idNum)}
          className="space-y-4 bg-slate-800 p-6 rounded-lg"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Data *
              </label>
              <input
                name="data"
                type="date"
                required
                defaultValue={trening.data}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Godzina *
              </label>
              <input
                name="godzina"
                type="time"
                required
                defaultValue={trening.godzina}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Typ *</label>
            <select
              name="typ"
              required
              defaultValue={trening.typ}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            >
              <option value="trening">Trening</option>
              <option value="mecz">Mecz</option>
              <option value="sparing">Sparing</option>
              <option value="turniej">Turniej</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Miejsce
            </label>
            <input
              name="miejsce"
              defaultValue={trening.miejsce ?? ''}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Przeciwnik
            </label>
            <input
              name="przeciwnik"
              defaultValue={trening.przeciwnik ?? ''}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Notatki
            </label>
            <textarea
              name="notatki"
              rows={3}
              defaultValue={trening.notatki ?? ''}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-3 rounded-lg"
            >
              Zapisz zmiany
            </button>
            <DeleteButton id={idNum} />
          </div>
        </form>
      </div>
    </main>
  );
}