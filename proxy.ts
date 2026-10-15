import { updateSession } from '@/lib/supabase/proxy';
import { type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  /*
   * Przepuszczamy TYLKO żądania, które mogą potrzebować auth.
   *
   * Wykluczamy:
   *   - _next/static, _next/image, _next/data — wewnętrzne assety Next.js
   *   - manifest.json, sw.js, robots.txt, sitemap.xml — potrzebne bez auth
   *   - wszelkie pliki statyczne po rozszerzeniu (obrazy, fonty, JS, CSS, mapy)
   *
   * Efekt: proxy nie tworzy klienta Supabase dla assetów.
   */
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|js|mjs|css|woff|woff2|ttf|otf|map)$).*)',
  ],
};