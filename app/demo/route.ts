import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  // Zbieramy ciasteczka, które Supabase chce ustawić
  const cookiesToSet: { name: string; value: string; options: any }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(newCookies) {
          newCookies.forEach((c) => cookiesToSet.push(c));
        },
      },
    }
  );

  // Wyloguj poprzednią sesję (na wszelki wypadek)
  await supabase.auth.signOut();

  // Zaloguj na konto demo
  const { error } = await supabase.auth.signInWithPassword({
    email: 'demo@talentapp.pl',
    password: 'DemoTrener2026!',
  });

  if (error) {
    return NextResponse.redirect(
      new URL(
        '/auth/error?error=' + encodeURIComponent('Demo jest chwilowo niedostępne.'),
        request.url
      )
    );
  }

  // Przekierowanie na dashboard
  const response = NextResponse.redirect(new URL('/dashboard?demo=true', request.url));

  // RĘCZNIE ustawiamy ciasteczka sesji na odpowiedzi
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}