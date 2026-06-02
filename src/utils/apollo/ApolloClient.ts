/*eslint complexity: ["error", 8]*/

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from '@apollo/client';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface SessionData {
  token: string;
  createdTime: number;
}

/**
 * Middleware operation
 * If we have a session token in localStorage, add it to the GraphQL request as a Session header.
 */
export const middleware = new ApolloLink((operation, forward) => {
  /**
   * If session data exist in local storage, set value as session header.
   * Here we also delete the session if it is older than 7 days
   */
  // Cache the localStorage read to avoid multiple accesses across middleware and afterware
  const cachedWooSession =
    globalThis.window === undefined ? null : localStorage.getItem('woo-session');
  
  const sessionData: SessionData | null = cachedWooSession
    ? JSON.parse(cachedWooSession)
    : null;

  const headers: Record<string, string> = {};

  if (sessionData?.token && sessionData?.createdTime) {
    const { token, createdTime } = sessionData;

    // Check if the token is older than 7 days
    if (Date.now() - createdTime > SEVEN_DAYS) {
      // If it is, delete it
      localStorage.removeItem('woo-session');
      localStorage.setItem('woocommerce-cart', JSON.stringify({}));
    } else {
      // If it's not, use the token
      headers['woocommerce-session'] = `Session ${token}`;
    }
  }

  // Cookie-based authentication - no JWT tokens needed
  // Cookies are automatically included with credentials: 'include'

  operation.setContext({
    headers,
    // Pass the cached session to afterware to avoid re-reading localStorage
    cachedWooSession,
  });

  return forward(operation);
});

/**
 * Afterware operation.
 *
 * This catches the incoming session token and stores it in localStorage, for future GraphQL requests.
 */
export const afterware = new ApolloLink((operation, forward) =>
  forward(operation).map((response) => {
    /**
     * Check for session header and update session in local storage accordingly.
     */
    const context = operation.getContext();
    const {
      response: { headers },
      cachedWooSession,
    } = context;

    const session = headers.get('woocommerce-session');

    if (session && globalThis.window !== undefined) {
      // Use the cached value from middleware instead of re-reading localStorage
      if ('false' === session) {
        // Remove session data if session destroyed.
        localStorage.removeItem('woo-session');
        // Update session new data if changed.
      } else if (!cachedWooSession) {
        localStorage.setItem(
          'woo-session',
          JSON.stringify({ token: session, createdTime: Date.now() }),
        );
      }
    }

    return response;
  }),
);

const isServerSide = globalThis.window === undefined;

// Apollo GraphQL client.
const client = new ApolloClient({
  ssrMode: isServerSide,
  link: middleware.concat(
    afterware.concat(
      createHttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
        fetch,
        credentials: 'include', // Include cookies for authentication
      }),
    ),
  ),
  cache: new InMemoryCache(),
});

export default client;
