'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Trash2, User } from 'lucide-react';
import { zapiszZgode, usunZgode } from './actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type Consent = {
  id: number;
  consent_type: string;
  consent_holder_name: string | null;
  consent_holder_email: string | null;
  consent_holder_phone: string | null;
  consent_given_at: string;
  consent_method: string;
  consent_notes: string | null;
};

export function ConsentForm({
  zawodnikId,
  druzynaId,
  existingConsents,
}: {
  zawodnikId: number;
  druzynaId: string;
  existingConsents: Consent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [typ, setTyp] = useState<'rodzic' | 'opiekun'>('rodzic');
  const [imieNazwisko, setImieNazwisko] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [metoda, setMetoda] = useState<'paper' | 'electronic' | 'verbal'>('paper');
  const [uwagi, setUwagi] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imieNazwisko.trim()) {
      toast.error('Wpisz imię i nazwisko rodzica/opiekuna');
      return;
    }
    const fd = new FormData();
    fd.append('zawodnik_id', String(zawodnikId));
    fd.append('druzyna_id', druzynaId);
    fd.append('consent_type', typ);
    fd.append('consent_holder_name', imieNazwisko);
    fd.append('consent_holder_email', email);
    fd.append('consent_holder_phone', telefon);
    fd.append('consent_method', metoda);
    fd.append('consent_notes', uwagi);

    startTransition(async () => {
      const res = await zapiszZgode(fd);
      if (res?.error) {
        toast.error('Błąd', { description: res.error });
      } else {
        toast.success('Zgoda zapisana');
        router.refresh();
        setImieNazwisko(''); setEmail(''); setTelefon(''); setUwagi('');
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60">
        <div>
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">
            Typ zgody
          </label>
          <div className="flex gap-2">
            {(['rodzic', 'opiekun'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTyp(t)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  typ === t
                    ? 'bg-green-500/15 border-green-400/50 text-green-400'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                {t === 'rodzic' ? 'Rodzic' : 'Opiekun prawny'}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">
            Imię i nazwisko {typ === 'rodzic' ? 'rodzica' : 'opiekuna'} *
          </span>
          <input
            value={imieNazwisko}
            onChange={e => setImieNazwisko(e.target.value)}
            required
            placeholder="np. Jan Kowalski"
            className="w-full bg-white/5 border border-white/15 focus:border-green-400/60 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">
            Email (opcjonalnie)
          </span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="rodzic@email.pl"
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">
            Telefon (opcjonalnie)
          </span>
          <input
            type="tel"
            value={telefon}
            onChange={e => setTelefon(e.target.value)}
            placeholder="600 100 200"
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none"
          />
        </label>

        <div>
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">
            Forma zgody
          </span>
          <div className="flex gap-2">
            {[
              { v: 'paper', l: 'Pisemna' },
              { v: 'electronic', l: 'Elektroniczna' },
              { v: 'verbal', l: 'Ustna' },
            ].map(m => (
              <button
                key={m.v}
                type="button"
                onClick={() => setMetoda(m.v as 'paper' | 'electronic' | 'verbal')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  metoda === m.v
                    ? 'bg-blue-500/15 border-blue-400/50 text-blue-400'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                {m.l}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">
            Uwagi (opcjonalnie)
          </span>
          <textarea
            value={uwagi}
            onChange={e => setUwagi(e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white outline-none resize-none"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 disabled:opacity-50"
        >
          <Save className="w-4 h-4 inline mr-2" />
          Zapisz zgodę
        </button>
      </form>

      {existingConsents.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">
            Zarejestrowane zgody
          </h3>
          {existingConsents.map(c => (
            <div key={c.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-bold text-white">
                  {c.consent_holder_name}
                  <span className="text-xs text-white/50 ml-2">({c.consent_type})</span>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {c.consent_method} · {new Date(c.consent_given_at).toLocaleDateString('pl-PL')}
                  {c.consent_holder_email && ` · ${c.consent_holder_email}`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteId(c.id)}
                className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-400/30 text-red-400 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Usunąć zgodę?"
        message="Zgoda zostanie trwale usunięta. Zawodnik straci flagę has_consent."
        variant="danger"
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId === null) return;
          const fd = new FormData();
          fd.append('id', String(deleteId));
          startTransition(async () => {
            const res = await usunZgode(fd);
            if (res?.error) {
              toast.error('Błąd', { description: res.error });
            } else {
              toast.success('Zgoda usunięta');
              setDeleteId(null);
              router.refresh();
            }
          });
        }}
      />
    </>
  );
}