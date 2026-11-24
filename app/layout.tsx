// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Talent - Aplikacja Trenera',
  description: 'Zarządzaj drużyną, treningami i statystykami.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <head>
        {/* Wymuszenie załadowania Tailwinda bezpośrednio przez CDN (omija błędy buildu) */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}