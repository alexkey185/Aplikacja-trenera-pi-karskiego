import type { Metadata } from 'next';
import { Landing } from './Landing';

// Wymusza renderowanie przy każdym żądaniu - bez cache HTML
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'talent. – aplikacja dla trenerów piłki nożnej',
  description:
    'Obecność i plan treningów w jednym miejscu. Aplikacja dla trenerów piłki nożnej młodzieżowej, stworzona przez trenera.',
  openGraph: {
    title: 'talent. – Twoja drużyna, Twoje zasady.',
    description: 'Kadra, kalendarz, frekwencja i statystyki w jednym miejscu.',
  },
};

export default function Page() {
  return <Landing />;
}