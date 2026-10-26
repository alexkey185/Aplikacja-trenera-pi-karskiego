// middleware.ts
//
// Middleware Next.js - działa ZANIM strona się załaduje.
// Sprawdza czy user jest zalogowany, jeśli nie - przekierowuje na login.
//
// WAŻNE: Plik MUSI nazywać się "middleware.ts" i eksportować funkcję "middleware".
// Poprzedni plik "proxy.ts" z eksportem "proxy" NIE DZIAŁAŁ.

import { updateSession } from '@/lib/supabase/proxy';
import { type NextRequest, NextResponse } from 'next/server';

// Ta funkcja jest wywoływana dla KAŻDEGO żądania HTTP
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Matcher - mówi Next.js dla jakich ścieżek uruchamiać middleware
// Wykluczamy pliki statyczne (obrazki, fonty, favicon) żeby nie spowalniać
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml|icons/|screenshots/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|js|mjs|css|woff|woff2|ttf|otf|map)$).*)',
  ],
};