import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

/**
 * ESLint flat config (Next.js 16 removed `next lint`; run `pnpm lint`).
 * - core-web-vitals: Next.js, React and React Hooks rules (CWV rules as errors)
 * - typescript: typescript-eslint recommended rules
 * - prettier: turns off stylistic rules that conflict with Prettier
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Project-specific generated/vendored output:
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'pa11y-reports/**',
    'src/styles/*.min.css',
  ]),
]);

export default eslintConfig;
