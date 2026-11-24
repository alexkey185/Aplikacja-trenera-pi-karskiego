import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // <--- TO MUSI TU BYĆ

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Talent',
  description: 'Aplikacja trenera',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-slate-950 text-white`}>
        {children}
      </body>
    </html>
  );
}