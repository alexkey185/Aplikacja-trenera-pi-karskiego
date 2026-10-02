import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ═══════════════════════════════════════════════════════════
// Ścieżki publiczne — dostępne bez logowania.
// Middleware NIE odpytuje Supabase Auth dla tych tras.
//
// '/'                    — landing
// '/prywatnosc', '/regulamin' — dokumenty prawne
// '/auth/*'              — login, signup, confirm, error, forgot, update-password
//
// Uwaga: /auth/confirm i /auth/update-password same zarządzają sesją
// (route handler / page), więc nie potrzebują sprawdzenia w middleware.
// ═══════════════════════════════════════════════════════════
const PUBLIC_PATHS = ['/', '/prywatnosc', '/regulamin', '/auth'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  });
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ═══════════════════════════════════════════════════════════
  // FAST PATH: ścieżki publiczne — zwróć NextResponse.next()
  // bez tworzenia klienta Supabase i bez wywołania getUser().
  //
  // Oszczędność: ~50-150ms RTT do Supabase Auth per request.
  //
  // Bezpieczeństwo: sesja odświeży się przy najbliższym wejściu
  // na chronioną trasę. Nie musimy tego robić tu — token
  // i tak żyje kilka dni, a refresh działa na zasadzie rotacji
  // cookie przy okazji zapytania.
  // ═══════════════════════════════════════════════════════════
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

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

  // Brak usera na chronionej trasie → redirect na login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';

    const redirectResponse = NextResponse.redirect(url);

    // ═══════════════════════════════════════════════════════
    // KRYTYCZNE: skopiuj cookies z supabaseResponse do redirectu
    //
    // Supabase przy każdym żądaniu odświeża token sesji i ustawia
    // nowe cookies w `supabaseResponse.cookies`. Ale NextResponse.redirect()
    // tworzy NOWY obiekt z pustymi cookies — te odświeżone przepadają.
    //
    // Efekt bez tego fixu: user „losowo" wylogowuje się przy nawigacji
    // (bo token się nie odświeżył w przeglądarce).
    // ═══════════════════════════════════════════════════════
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return supabaseResponse;
}