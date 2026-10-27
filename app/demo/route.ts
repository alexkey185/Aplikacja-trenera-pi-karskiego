import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  // Wyloguj poprzednią sesję (unikamy konfliktów)
  await supabase.auth.signOut();

  // Zaloguj na konto demo
  const { error } = await supabase.auth.signInWithPassword({
    email: 'demo@talentapp.pl',
    password: 'DemoTrener2026!',
  });

  if (error) {
    console.error('Demo login error:', error);
    return NextResponse.redirect(
      new URL(
        '/auth/error?error=' + encodeURIComponent('Demo jest chwilowo niedostępne.'),
        request.url
      )
    );
  }

  return NextResponse.redirect(new URL('/dashboard?demo=true', request.url));
}