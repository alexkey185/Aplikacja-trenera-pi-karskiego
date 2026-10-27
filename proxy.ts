// proxy.ts — Next.js 16 middleware convention
import { updateSession } from '@/lib/supabase/proxy';
import { type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml|icons/|screenshots/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|js|mjs|css|woff|woff2|ttf|otf|map)$).*)',
  ],
};