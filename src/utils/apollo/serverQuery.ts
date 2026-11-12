import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import type { DocumentNode } from 'graphql';

/**
 * Shared Apollo client for Server Components and `generateMetadata`.
 *
 * Safe to share between requests: every query uses `fetchPolicy: 'no-cache'`,
 * so nothing is stored in the cache, and no cookies or session headers are sent.
 * Caching is controlled by the page's `revalidate` / `dynamic` config.
 */
const serverClient = new ApolloClient({
  ssrMode: true,
  link: createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    fetch,
  }),
  cache: new InMemoryCache(),
});

export const serverQuery = <
  TData = Record<string, unknown>,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
) =>
  serverClient.query<TData, TVariables>({
    query,
    variables,
    fetchPolicy: 'no-cache',
  });
