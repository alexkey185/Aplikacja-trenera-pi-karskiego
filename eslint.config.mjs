// eslint.config.mjs
// ═══════════════════════════════════════════════════════════════
// Konfiguracja ESLint 9 (flat config) dla Next.js 16.
//
// UWAGA: Next.js 16 wspiera nowy format flat config natywnie
// przez "eslint-config-next" — bez FlatCompat (który się psuje
// na ESLint 9 z powodu circular structure).
// ═══════════════════════════════════════════════════════════════

import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
];

export default eslintConfig;