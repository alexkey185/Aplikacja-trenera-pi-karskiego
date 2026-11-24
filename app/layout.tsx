// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // <-- To ładuje Tailwind v4

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
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}