import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ═══════════════════════════════════════════════════════════
// Ścieżki publiczne - dostępne bez logowania.
// Middleware NIE odpytuje Supabase Auth dla tych tras.
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
  // Next.js 16 / PKCE: gdy Supabase (lub Google) przekieruje
  // na root z ?code=..., przekieruj go na /auth/callback.
  //
  // Zapobiega „białemu ekranowi" gdy redirectTo nie zadziała
  // dokładnie tak, jak zaplanowano. Defensywnie.
  // ═══════════════════════════════════════════════════════════
  if (pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
  }

  // ═══════════════════════════════════════════════════════════
  // FAST PATH: ścieżki publiczne - zwróć NextResponse.next()
  // bez tworzenia klienta Supabase i bez wywołania getUser().
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

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';

    const redirectResponse = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return supabaseResponse;
}