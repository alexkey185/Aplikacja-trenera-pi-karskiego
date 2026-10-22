import type { Metadata } from 'next';
import { Landing } from './Landing';

// Statyczny render + ISR co 1h.
// Landing jest marketingowy - nie potrzebuje świeżości co request.
// Usunięcie force-dynamic = szybszy TTFB na mobile (zimny start).
export const revalidate = 3600;

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