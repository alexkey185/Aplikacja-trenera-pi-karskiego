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
        registrations.forEach((reg) => {
          reg.unregister();
          console.log('✓ Service Worker wyrejestrowany (tryb dev)');
        });
      });
      return;
    }

    let cancelled = false;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        if (cancelled) return;
        console.log('✓ Service Worker zarejestrowany:', reg.scope);

        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(newWorker);
            }
          });
        });

        setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000);
      } catch (err) {
        console.warn('✗ Rejestracja SW nieudana:', err);
      }
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }

    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange
      );
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
          waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          toast.dismiss(toastId);
        },
      },
      icon: <RefreshCw className="w-4 h-4" />,
    });

    return () => {
      toast.dismiss(toastId);
    };
  }, [waitingWorker]);

  return null;
}