import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureConsentRecord } from '@/lib/consents';
import { safeNext } from '@/lib/auth/safe-redirect';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'), '/dashboard');

  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocal = process.env.NODE_ENV === 'development';
  const baseUrl = isLocal
    ? origin
    : forwardedHost
    ? `https://${forwardedHost}`
    : origin;

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/auth/error?error=${encodeURIComponent('Brak kodu autoryzacji')}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${baseUrl}/auth/error?error=${encodeURIComponent(error.message)}`
    );
  }

  // P1.1: Zapisujemy zgodę RODO dla użytkowników OAuth
  await ensureConsentRecord();

  return NextResponse.redirect(`${baseUrl}${next}`);
}