import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * Returns false on the server and during hydration, and true once mounted in the browser.
 * Use it to render browser-only state (such as the cart) without a hydration mismatch.
 */
export const useHasMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
