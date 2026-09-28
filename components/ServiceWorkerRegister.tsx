'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // NIE rejestruj Service Workera w trybie dev (powoduje cache problemów)
    if (process.env.NODE_ENV !== 'production') {
      // W trybie dev — wyrejestruj stary Service Worker, jeśli istnieje
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          reg.unregister();
          console.log('✓ Service Worker wyrejestrowany (tryb dev)');
        });
      });
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('✓ Service Worker zarejestrowany:', reg.scope);
        })
        .catch((err) => {
          console.warn('✗ Rejestracja SW nieudana:', err);
        });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}