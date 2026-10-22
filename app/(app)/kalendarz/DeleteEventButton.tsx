// app/(app)/kalendarz/DeleteEventButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, Calendar, Repeat } from 'lucide-react';
import { usunTreningZakres } from './[id]/edytuj/actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function DeleteEventButton({
  id,
  cyklId,
}: {
  id: number;
  cyklId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<'single' | 'all'>('single');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isCyclic = !!cyklId;

  const handleDelete = () => {
    const finalScope = isCyclic ? scope : 'single';
    setOpen(false);
    startTransition(async () => {
      const result = await usunTreningZakres(id, finalScope);

      if ('error' in result) {
        toast.error('Nie udalo sie usunac', {
          description: result.error,
        });
        return;
      }

      if (finalScope === 'all' && result.count > 1) {
        toast.success('Cala seria usunieta', {
          description: `Usunieto ${result.count} treningow z cyklu`,
        });
      } else {
        toast.success('Trening usuniety');
      }

      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        disabled={isPending}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/40 flex items-center justify-center text-white/40 hover:text-red-400 transition-all disabled:opacity-50"
        title="Usun wydarzenie"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <ConfirmDialog
        open={open}
        title={isCyclic ? 'Usunac z serii?' : 'Usunac to wydarzenie?'}
        variant="danger"
        confirmLabel={
          isPending ? 'Usuwanie...' : isCyclic && scope === 'all' ? 'Usun serie' : 'Usun'
        }
        loading={isPending}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
        message={
          isCyclic ? (
            <div className="space-y-3">
              <p className="text-sm">
                Ten trening jest czescia <span className="font-bold text-white">cyklu</span>. Co
                chcesz usunac?
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setScope('single')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === 'single'
                      ? 'bg-blue-500/15 border-blue-400/60 ring-1 ring-blue-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-1">Tylko ten dzien</div>
                  <div className="text-[10px] text-white/60 leading-tight">
                    Usuwa wybrany trening
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === 'all'
                      ? 'bg-purple-500/15 border-purple-400/60 ring-1 ring-purple-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-1">Cala seria</div>
                  <div className="text-[10px] text-white/60 leading-tight">
                    Usuwa wszystkie z cyklu
                  </div>
                </button>
              </div>
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-2 text-xs text-red-200">
                Zostana usuniete tez wpisy obecnosci.{' '}
                <strong>Tej operacji nie mozna cofnac.</strong>
              </div>
            </div>
          ) : (
            <>
              Usuna sie tez wszystkie wpisy obecnosci dla tego treningu.
              <br />
              <br />
              <span style={{ color: '#f87171' }}>Tej operacji nie mozna cofnac.</span>
            </>
          )
        }
      />
    </>
  );
}