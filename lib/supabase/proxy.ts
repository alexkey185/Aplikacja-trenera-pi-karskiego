import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Ścieżki publiczne — dostępne bez logowania
const PUBLIC_PATHS = ['/', '/prywatnosc', '/regulamin'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  });
}

export async function updateSession(request: NextRequest) {
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

  const { pathname } = request.nextUrl;

  // Przekieruj na login jeśli: brak usera, ścieżka nie jest publiczna,
  // i nie jest to ścieżka auth
  if (!user && !isPublicPath(pathname) && !pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';

    const redirectResponse = NextResponse.redirect(url);

    // ═══════════════════════════════════════════════════════
    // KRYTYCZNE: skopiuj cookies z supabaseResponse do redirectu
    //
    // Supabase przy każdym żądaniu odświeża token sesji i ustawia
    // nowe cookies w `supabaseResponse.cookies`. Ale `NextResponse.redirect()`
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