'use client';

import { useState } from 'react';
import { usunKonto } from '@/app/(app)/profil/actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    const result = await usunKonto();

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/60 text-red-300 hover:text-red-200 font-semibold py-3.5 rounded-2xl text-sm transition-all disabled:opacity-50 disabled:cursor-wait"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Usuwanie konta...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Usuń konto
          </>
        )}
      </button>

      <ConfirmDialog
        open={open}
        title="Usunąć konto?"
        variant="danger"
        confirmLabel={loading ? 'Usuwanie...' : 'Usuń konto'}
        cancelLabel="Anuluj"
        loading={loading}
        icon={<AlertTriangle className="w-6 h-6 text-red-400" strokeWidth={2.5} />}
        message={
          <div className="space-y-3">
            <p className="font-semibold text-white">
              Ta operacja jest nieodwracalna.
            </p>
            <p>Usunięte zostaną wszystkie Twoje dane:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lista zawodników</li>
              <li>Wszystkie treningi i wydarzenia</li>
              <li>Historia obecności</li>
              <li>Ustawienia konta</li>
            </ul>
            {error && (
              <div className="bg-red-500/15 border border-red-400/40 rounded-xl p-3 text-xs text-red-200 mt-2">
                Błąd: {error}
              </div>
            )}
          </div>
        }
        onCancel={() => {
          if (!loading) {
            setOpen(false);
            setError(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}