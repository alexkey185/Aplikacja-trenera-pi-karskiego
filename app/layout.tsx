import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Talent - Aplikacja Trenera',
  description: 'Zarządzaj drużyną, obecnością i treningami.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <body className={`${inter.className} bg-[#020617] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}