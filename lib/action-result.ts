export type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

/**
 * Wariant dla formularzy, które tylko sprawdzają powodzenie (bez pól).
 * Np. usuwanie, przenoszenie, import.
 */
export type SimpleResult = {
  error?: string;
  success?: boolean;
};

/**
 * Wariant dla formularzy z walidacją inline (useActionState).
 * Zawiera błędy per pole.
 */
export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;
