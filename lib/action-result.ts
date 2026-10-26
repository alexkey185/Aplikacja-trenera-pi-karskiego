import { revalidatePath } from 'next/cache';

export type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export type SimpleResult = {
  error?: string;
  success?: boolean;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

// ═══════════════════════════════════════════════════════════════
// Helper: rewalidacja ścieżek kalendarza
// Wywoływane po każdej mutacji treningów.
// Było zduplikowane w: dodajTrening, aktualizujTrening, usunTreningZakres, przeniesTrening.
// ═══════════════════════════════════════════════════════════════
export function revalidateKalendarz() {
  revalidatePath('/', 'layout');
  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  revalidatePath('/kalendarz/eksport');
  revalidatePath('/statystyki');
}