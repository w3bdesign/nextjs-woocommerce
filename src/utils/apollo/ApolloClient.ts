/*eslint complexity: ["error", 8]*/

import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  type NormalizedCacheObject,
} from '@apollo/client';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Versioned localStorage keys to prevent crashes on schema changes
const WOOCOMMERCE_CART_KEY = 'woocommerce-cart:v1';
const WOO_SESSION_KEY = 'woo-session:v1';

const isServer = () => globalThis.window === undefined;

interface SessionData {
  token: string;
  createdTime: number;
}

function readSession(): string | null {
  if (isServer()) return null;
  try {
    return localStorage.getItem(WOO_SESSION_KEY);
  } catch {
    return null;
  }
}

function parseSession(raw: string | null): SessionData | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    // Corrupt value – drop it so we don't keep failing on every request
    localStorage.removeItem(WOO_SESSION_KEY);
    return null;
  }
}

/**
 * Middleware operation
 * If we have a session token in localStorage, add it to the GraphQL request as a Session header.
 * Expired sessions (older than 7 days) are removed together with the cached cart.
 */
const middleware = new ApolloLink((operation, forward) => {
  const cachedWooSession = readSession();
  const sessionData = parseSession(cachedWooSession);

  const headers: Record<string, string> = {};

  if (sessionData?.token && sessionData?.createdTime) {
    if (Date.now() - sessionData.createdTime > SEVEN_DAYS) {
      localStorage.removeItem(WOO_SESSION_KEY);
      localStorage.setItem(WOOCOMMERCE_CART_KEY, JSON.stringify({}));
    } else {
      headers['woocommerce-session'] = `Session ${sessionData.token}`;
    }
  }

  operation.setContext({ headers, cachedWooSession });

  return forward(operation);
});

/**
 * Afterware operation.
 * Catches the incoming session token and stores it in localStorage for future GraphQL requests.
 */
const afterware = new ApolloLink((operation, forward) =>
  forward(operation).map((response) => {
    if (isServer()) return response;

    const { response: httpResponse, cachedWooSession } = operation.getContext();
    const session = httpResponse?.headers?.get('woocommerce-session');

    if (session) {
      if (session === 'false') {
        localStorage.removeItem(WOO_SESSION_KEY);
      } else if (!cachedWooSession) {
        localStorage.setItem(
          WOO_SESSION_KEY,
          JSON.stringify({ token: session, createdTime: Date.now() }),
        );
      }
    }

    return response;
  }),
);

const createHttp = () =>
  createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    fetch,
    credentials: 'include', // Include cookies for authentication
  });

/**
 * Creates a new Apollo client.
 *
 * On the server a fresh client (and cache) is created for every call so that
 * data is never shared between requests or users, and responses are never
 * served from a stale in-memory cache across ISR/SSR invocations.
 */
export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (isServer()) {
    return new ApolloClient({
      ssrMode: true,
      link: createHttp(),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
      },
    });
  }

  return new ApolloClient({
    link: ApolloLink.from([middleware, afterware, createHttp()]),
    cache: new InMemoryCache(),
  });
}

let browserClient: ApolloClient<NormalizedCacheObject> | undefined;

/**
 * Returns the Apollo client for the current environment.
 * - Server: always a new, request-scoped client.
 * - Browser: a memoized singleton shared by the whole app.
 */
export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (isServer()) return createApolloClient();
  browserClient ??= createApolloClient();
  return browserClient;
}
