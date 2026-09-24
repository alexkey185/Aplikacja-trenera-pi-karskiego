import Link from 'next/link';
import { dodajTrening } from './actions';

export default function NowyTrening() {
  const dzis = new Date().toISOString().split('T')[0];

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
          <h1 className="text-2xl font-bold">Nowe wydarzenie</h1>
        </header>

        <form
          action={dodajTrening}
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
                defaultValue={dzis}
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
                defaultValue="18:00"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Typ *</label>
            <select
              name="typ"
              required
              defaultValue="trening"
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
              placeholder="np. Boisko Orlik"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Przeciwnik (dla meczu/sparingu)
            </label>
            <input
              name="przeciwnik"
              placeholder="np. Orzeł Warszawa"
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
              placeholder="np. Zbiórka 17:30"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-3 rounded-lg"
          >
            Zapisz wydarzenie
          </button>
        </form>
      </div>
    </main>
  );
}