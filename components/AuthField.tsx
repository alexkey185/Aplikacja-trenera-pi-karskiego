'use client';

import { AlertCircle, type LucideIcon } from 'lucide-react';

type AuthFieldProps = {
  /** Ikona po lewej stronie labelki */
  icon: LucideIcon;
  /** Etykieta pola (np. "Email", "Hasło") */
  label: string;
  /** HTML name - wymagane dla autouzupełniania i FormData */
  name: string;
  /** HTML id - do powiązania label↔input (a11y) */
  id: string;
  /** Typ pola: email, password, text, tel */
  type?: 'email' | 'password' | 'text' | 'tel';
  /** Wartość pola (kontrolowany) */
  value: string;
  /** Handler zmiany */
  onChange: (value: string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Komunikat błędu (jeśli jest - pole na czerwono) */
  error?: string;
  /** Atrybut autocomplete (email, current-password, new-password, tel) */
  autoComplete?: string;
  /** Opcjonalny element po prawej stronie labelki (np. "Zapomniałeś?") */
  labelRight?: React.ReactNode;
};

export function AuthField({
  icon: Icon,
  label,
  name,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  labelRight,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  const hasError = !!error;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="flex items-center gap-2 text-[10px] font-semibold text-white/70 uppercase tracking-wider"
        >
          <Icon className="w-3.5 h-3.5 text-green-400" />
          {label}
        </label>
        {labelRight}
      </div>

      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all ${
          hasError
            ? 'border-red-400/70 focus:border-red-400 bg-red-500/5'
            : 'border-white/15 focus:border-green-400/60 focus:bg-white/10'
        }`}
      />

      {hasError && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300 animate-fadeIn"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}