'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ href = '/' }: { href?: string }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Jeśli user przyszedł z innej strony w tej samej sesji - wróć tam.
    // W przeciwnym razie idź do `href` (fallback = "/").
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      Powrót
    </button>
  );
}