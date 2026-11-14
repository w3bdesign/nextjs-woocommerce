import { ApolloClient, ApolloLink, Observable, execute, gql } from '@apollo/client';
import { describe, expect, it } from 'vitest';

import client, { afterware, middleware } from '@/utils/apollo/ApolloClient';

const SESSION_KEY = 'woo-session:v1';
const CART_KEY = 'woocommerce-cart:v1';
const DAY = 24 * 60 * 60 * 1000;
const QUERY = gql`
  query Test {
    ok
  }
`;

/** Runs the middleware + afterware against a fake backend that returns `responseHeaders`. */
const run = (responseHeaders: Record<string, string> = {}) => {
  let sentHeaders: Record<string, string> = {};
  const backend = new ApolloLink((operation) => {
    sentHeaders = operation.getContext().headers;
    operation.setContext({ response: { headers: new Headers(responseHeaders) } });
    return Observable.of({ data: { ok: true } });
  });

  return new Promise<{ sentHeaders: Record<string, string>; data: unknown }>(
    (resolve, reject) => {
      execute(middleware.concat(afterware.concat(backend)), { query: QUERY }).subscribe({
        next: ({ data }) => resolve({ sentHeaders, data }),
        error: reject,
      });
    },
  );
};

const storeSession = (token: string, ageMs: number) =>
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ token, createdTime: Date.now() - ageMs }),
  );

describe('Apollo session middleware', () => {
  it('sends no session header without a stored session', async () => {
    const { sentHeaders, data } = await run();
    expect(sentHeaders).toEqual({});
    expect(data).toEqual({ ok: true });
  });

  it('sends a stored session that is less than 7 days old', async () => {
    storeSession('abc', 6 * DAY);
    const { sentHeaders } = await run();
    expect(sentHeaders).toEqual({ 'woocommerce-session': 'Session abc' });
  });

  it('drops a session older than 7 days and resets the cart', async () => {
    storeSession('old', 8 * DAY);
    const { sentHeaders } = await run();

    expect(sentHeaders).toEqual({});
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(localStorage.getItem(CART_KEY)).toBe('{}');
  });

  it('ignores stored session data without a token', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ createdTime: Date.now() }));
    const { sentHeaders } = await run();
    expect(sentHeaders).toEqual({});
  });
});

describe('Apollo session afterware', () => {
  it('stores a new session token from the response', async () => {
    await run({ 'woocommerce-session': 'new-token' });

    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}');
    expect(stored.token).toBe('new-token');
    expect(stored.createdTime).toBeTypeOf('number');
  });

  it('keeps the existing session when one is already stored', async () => {
    storeSession('existing', DAY);
    await run({ 'woocommerce-session': 'other-token' });
    expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}').token).toBe('existing');
  });

  it('removes the session when the backend destroys it', async () => {
    storeSession('existing', DAY);
    await run({ 'woocommerce-session': 'false' });
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('does nothing when the response has no session header', async () => {
    await run();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});

describe('Apollo client', () => {
  it('exports a configured client', () => {
    expect(client).toBeInstanceOf(ApolloClient);
  });
});
