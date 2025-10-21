/*eslint complexity: ["error", 8]*/

import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { mockLink } from './mockLink';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Middleware operation
 * If we have a session token in localStorage, add it to the GraphQL request as a Session header.
 */
export const middleware = new ApolloLink(async (operation, forward) => {
  /**
   * If session data exist in local storage, set value as session header.
   * Here we also delete the session if it is older than 7 days
   */
  const sessionData = process.browser
    ? JSON.parse(localStorage.getItem('woo-session'))
    : null;

  const headers = {};

  if (sessionData && sessionData.token && sessionData.createdTime) {
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
    } = context;

    const session = headers.get('woocommerce-session');

    if (session && process.browser) {
      if ('false' === session) {
        // Remove session data if session destroyed.
        localStorage.removeItem('woo-session');
        // Update session new data if changed.
      } else if (!localStorage.getItem('woo-session')) {
        localStorage.setItem(
          'woo-session',
          JSON.stringify({ token: session, createdTime: Date.now() }),
        );
      }
    }

    return response;
  }),
);

const clientSide = typeof window === 'undefined';

// Decide whether to use mock link
const useMocks =
  (process.env.NEXT_PUBLIC_ENABLE_MOCKS || '').toString().toLowerCase() === 'true' ||
  !process.env.NEXT_PUBLIC_GRAPHQL_URL;

const link = useMocks
  ? mockLink
  : middleware.concat(
      afterware.concat(
        createHttpLink({
          uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
          fetch,
          credentials: 'include', // Include cookies for authentication
        }),
      ),
    );

// Apollo GraphQL client.
const client = new ApolloClient({
  ssrMode: clientSide,
  link,
  cache: new InMemoryCache(),
});

export default client;
