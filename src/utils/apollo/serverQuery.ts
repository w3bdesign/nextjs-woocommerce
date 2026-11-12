import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import type { DocumentNode } from 'graphql';

/**
 * Creates a fresh Apollo client for server-side usage (Server Components,
 * generateMetadata, Route Handlers).
 *
 * A new client and cache are created per call so data is never shared between
 * requests/users. The browser-only WooCommerce session middleware/afterware
 * from `ApolloClient.ts` is intentionally not used here.
 *
 * Caching/revalidation is controlled by the route segment config
 * (`export const revalidate` / `export const dynamic`) of the calling page.
 */
const createServerClient = () =>
  new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      fetch,
    }),
    cache: new InMemoryCache(),
  });

export const serverQuery = async <
  TData = Record<string, unknown>,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
) => {
  const client = createServerClient();
  return client.query<TData, TVariables>({
    query,
    variables,
    fetchPolicy: 'no-cache',
  });
};
