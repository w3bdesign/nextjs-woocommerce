// @vitest-environment node
import { gql } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  ApolloClient: class {
    query = query;
  },
}));

import { serverQuery } from '@/utils/apollo/serverQuery';

const PRODUCT = gql`
  query Product($slug: ID!) {
    product(id: $slug) {
      name
    }
  }
`;

describe('serverQuery', () => {
  it('runs the query without caching and returns the result', async () => {
    const result = { data: { product: { name: 'Test Simple' } } };
    query.mockResolvedValueOnce(result);

    await expect(serverQuery(PRODUCT, { slug: 'test-simple' })).resolves.toBe(result);
    expect(query).toHaveBeenCalledWith({
      query: PRODUCT,
      variables: { slug: 'test-simple' },
      fetchPolicy: 'no-cache',
    });
  });

  it('allows queries without variables', async () => {
    query.mockResolvedValueOnce({ data: {} });
    await serverQuery(PRODUCT);
    expect(query).toHaveBeenLastCalledWith(
      expect.objectContaining({ variables: undefined, fetchPolicy: 'no-cache' }),
    );
  });
});
