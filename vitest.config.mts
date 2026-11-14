import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Unit and component tests (Vitest + React Testing Library).
 * Playwright E2E specs live in src/tests/**\/*.spec.ts and are not run here.
 */
export default defineConfig({
  plugins: [react()],
  // Resolve the `@/*` alias from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'src/tests/**'],
    css: false,
    coverage: {
      provider: 'v8',
      // Equivalent of Jest's collectCoverageFrom: every matching file is
      // reported, including files no test imports (shown as 0%).
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/tests/**',
        'src/types/**',
        '**/__tests__/**',
        '**/*.d.ts',
        // Async Server Component shells are covered by Playwright instead.
        'src/app/**/page.tsx',
        'src/app/layout.tsx',
        'src/app/loading.tsx',
        // Login/account is not linked from the store UI, so it is not tested.
        'src/app/min-konto/**',
        'src/components/User/**',
        'src/utils/auth.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Set just under the current numbers so a drop in coverage fails the run.
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 65,
        lines: 70,
      },
    },
  },
});
