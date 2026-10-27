import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(
          newCookies: { name: string; value: string; options: CookieOptions }[]
        ) {
          newCookies.forEach((c) => cookiesToSet.push(c));
        },
      },
    }
  );

  await supabase.auth.signOut();

  // ZMIENIONE HASŁO NA PRAWIDŁOWE
  const { error } = await supabase.auth.signInWithPassword({
    email: 'demo@talentapp.pl',
    password: '@DemoTrener',
  });

  if (error) {
    console.error('Demo login error:', error.message, error.status);
    return NextResponse.redirect(
      new URL(
        '/auth/error?error=' + encodeURIComponent('Demo jest chwilowo niedostępne.'),
        request.url
      )
    );
  }

  const response = NextResponse.redirect(new URL('/dashboard?demo=true', request.url));

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}