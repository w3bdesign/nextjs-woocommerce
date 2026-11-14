import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { createElement } from 'react';
import type { ImgHTMLAttributes } from 'react';

// One shared router object; tests read it with `useRouter()` and assert on it.
const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
}));

// Override per test with `vi.mocked(usePathname).mockReturnValue('/kasse')`.
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => router),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Render next/image as a plain <img>; drop Next-only props.
vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
  }) => createElement('img', props),
}));

afterEach(async () => {
  cleanup();
  // Tests that opt into the `node` environment have no localStorage.
  globalThis.localStorage?.clear?.();
  vi.clearAllMocks();
  // Restore the default pathname after tests that override it.
  const { usePathname } = await import('next/navigation');
  vi.mocked(usePathname).mockImplementation(() => '/');
});
