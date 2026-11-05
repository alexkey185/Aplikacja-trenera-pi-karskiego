'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export function ServiceWorkerRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
      return;
    }

    let cancelled = false;
    let isUpdating = false; // <-- Flaga zapobiegająca niechcianym reloadom
    let intervalId: NodeJS.Timeout;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        if (cancelled) return;

        if (reg.waiting) setWaitingWorker(reg.waiting);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
            }
          });
        });

        // Zapisujemy ID interwału, żeby móc go wyczyścić
        intervalId = setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000);
      } catch (err) {
        console.warn('Rejestracja SW nieudana:', err);
      }
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);

    const onControllerChange = () => {
      if (!isUpdating) return; // <-- Blokada przy niezamierzonym reloadzie
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId); // <-- Czyszczenie
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  useEffect(() => {
    if (!waitingWorker) return;

    const toastId = toast.info('Dostępna nowa wersja', {
      description: 'Odśwież, żeby zobaczyć najnowsze zmiany.',
      duration: Infinity,
      action: {
        label: 'Odśwież',
        onClick: () => {
          // Ręczne kliknięcie zezwala na reload
          waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          toast.dismiss(toastId);
          window.location.reload(); 
        },
      },
      icon: <RefreshCw className="w-4 h-4" />,
    });

return () => { toast.dismiss(toastId); };
  }, [waitingWorker]);

  return null;
}