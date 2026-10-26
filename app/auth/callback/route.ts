import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureConsentRecord } from '@/lib/consents';

function safeNext(rawNext: string | null): string {
  const fallback = '/dashboard';
  if (!rawNext) return fallback;

  let candidate = rawNext;

  if (/^https?:\/\//i.test(rawNext)) {
    try {
      const url = new URL(rawNext);
      const allowedHosts = new Set([
        'talentapp.pl',
        'www.talentapp.pl',
        'localhost:3000',
        'localhost:3001',
      ]);
      if (!allowedHosts.has(url.host)) return fallback;
      candidate = url.pathname + url.search + url.hash;
    } catch {
      return fallback;
    }
  }

  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;
  if (candidate.includes('://')) return fallback;

  const lowered = candidate.toLowerCase();
  if (
    lowered.includes('javascript:') ||
    lowered.includes('data:') ||
    lowered.includes('vbscript:')
  ) {
    return fallback;
  }

  return candidate;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

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