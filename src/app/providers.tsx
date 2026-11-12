'use client';

import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';

import client from '@/utils/apollo/ApolloClient';
import CartInitializer from '@/components/Cart/CartInitializer.component';

/**
 * Client-side providers for the App Router (replaces the providers in pages/_app.tsx).
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <CartInitializer />
      {children}
    </ApolloProvider>
  );
}
