'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ href = '/auth/sign-up' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      Powrót
    </Link>
  );
}