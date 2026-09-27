import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Talent — Aplikacja Trenera',
  description: 'Zarządzaj drużyną, treningami i frekwencją',
  applicationName: 'Talent',
  appleWebApp: {
    capable: true,
    title: 'Talent',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        {/* Preconnect do Supabase — szybsze pierwsze zapytanie */}
        {supabaseUrl && (
          <>
            <link rel="preconnect" href={supabaseUrl} />
            <link rel="dns-prefetch" href={supabaseUrl} />
          </>
        )}

        {/* Preload favicon + ikony */}
        <link rel="preload" as="image" href="/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}