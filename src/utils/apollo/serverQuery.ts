import type { DocumentNode } from 'graphql';
import type { OperationVariables } from '@apollo/client';

import { createApolloClient } from './ApolloClient';

/**
 * Runs a GraphQL query from getStaticProps/getServerSideProps with a
 * request-scoped Apollo client.
 *
 * Never throws: network or GraphQL failures are logged and returned as
 * `null`, so callers can decide between `notFound`, a fallback UI or keeping
 * the previously generated ISR page.
 */
export async function serverQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(query: DocumentNode, variables?: TVariables): Promise<TData | null> {
  try {
    const { data, error } = await createApolloClient().query<
      TData,
      TVariables
    >({
      query,
      variables,
    });

    if (error) {
      console.error('[serverQuery] GraphQL error:', error.message);
    }

    return data ?? null;
  } catch (error) {
    console.error('[serverQuery] Request failed:', error);
    return null;
  }
}
