import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Geist } from 'next/font/google';
import { Toaster } from 'sonner';
import { BottomNav } from '@/components/BottomNav';
import { ContentWrapper } from '@/components/ContentWrapper';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import './globals.css';

const defaultUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Talent - Aplikacja Trenera',
  description: 'Aplikacja dla trenerow pilki noznej',
  applicationName: 'Talent',
  appleWebApp: {
    capable: true,
    title: 'Talent',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: 'p2WJ1j4lfdBzEl4jjY20f7JITh2Q2jPirJZvyvDZsdk',
  },
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
});

function getDzisISO(): string {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Warsaw',
  });
}

async function BottomNavServer() {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();

  const [userResult, dzisiajResult] = await Promise.all([
    supabase.auth.getUser(),
    druzynaId
      ? supabase
          .from('treningi')
          .select('*', { count: 'exact', head: true })
          .eq('druzyna_id', druzynaId)
          .eq('data', getDzisISO())
      : Promise.resolve({ count: 0, data: null, error: null }),
  ]);

  const user = userResult.data.user;
  const dzisiajCount = dzisiajResult.count ?? 0;

  return (
    <BottomNav
      dzisiajCount={dzisiajCount}
      userEmail={user?.email ?? null}
      userImie={(user?.user_metadata?.imie as string | undefined) ?? null}
      userNazwisko={(user?.user_metadata?.nazwisko as string | undefined) ?? null}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        {supabaseUrl && (
          <>
            <link rel="preconnect" href={supabaseUrl} />
            <link rel="dns-prefetch" href={supabaseUrl} />
          </>
        )}

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />

        <meta name="theme-color" content="#0a0e1a" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <ContentWrapper>{children}</ContentWrapper>

        <Suspense fallback={null}>
          <BottomNavServer />
        </Suspense>

        <ServiceWorkerRegister />

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3500}
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6)',
            },
          }}
        />
      </body>
    </html>
  );
}