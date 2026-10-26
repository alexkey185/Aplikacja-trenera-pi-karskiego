// lib/supabase/proxy.ts
//
// Logika middleware - sprawdzanie sesji + nagłówki bezpieczeństwa.
// Wywoływane z middleware.ts dla każdego żądania.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Ścieżki publiczne - dostępne bez logowania
const PUBLIC_PATHS = ['/', '/prywatnosc', '/regulamin', '/auth'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  });
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Next.js 16 / PKCE: przekieruj ?code= na /auth/callback
  if (pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
  }

  // FAST PATH: ścieżki publiczne - nie sprawdzamy sesji
  if (isPublicPath(pathname)) {
    const response = NextResponse.next({ request });
    addSecurityHeaders(response);
    return response;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Nie zalogowany → przekieruj na login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    addSecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  // Zalogowany → dodaj nagłówki bezpieczeństwa i przepuść
  addSecurityHeaders(supabaseResponse);
  return supabaseResponse;
}

/**
 * Dodaje nagłówki bezpieczeństwa do każdej odpowiedzi.
 * To jest WAŻNE - chroni przed atakami XSS, clickjacking itp.
 */
function addSecurityHeaders(response: NextResponse) {
  // HSTS - wymuszaj HTTPS przez 1 rok + subdomeny
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Clickjacking protection - nie pozwalaj na iframe
  response.headers.set('X-Frame-Options', 'DENY');

  // Blokuj MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Polityka referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - wyłącz niepotrzebne API przeglądarki
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content Security Policy - skąd można ładować zasoby
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseUrl} wss://${supabaseUrl.replace('https://', '')} https://*.supabase.co`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
}