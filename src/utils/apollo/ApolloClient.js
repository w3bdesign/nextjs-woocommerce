/*eslint complexity: ["error", 8]*/

import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { mockLink } from './mockLink';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Safely parse and validate session data
 */
const parseSessionData = (sessionData) => {
  try {
    const parsed = JSON.parse(sessionData);
    if (!parsed?.token || !parsed?.createdTime) return null;
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Check if session token has expired (older than 7 days)
 */
const isSessionExpired = (createdTime) => {
  return Date.now() - createdTime > SEVEN_DAYS;
};

/**
 * Get session headers if valid session exists
 * SSR-safe: returns empty object on server
 */
const getSessionHeaders = () => {
  if (typeof window === 'undefined') return {};

  try {
    const sessionData = localStorage.getItem('woo-session');
    if (!sessionData) return {};

    const parsed = parseSessionData(sessionData);
    if (!parsed) return {};

    const { token, createdTime } = parsed;

    // Check if the token is older than 7 days
    if (isSessionExpired(createdTime)) {
      localStorage.removeItem('woo-session');
      localStorage.setItem('woocommerce-cart', JSON.stringify({}));
      return {};
    }

    return { 'woocommerce-session': `Session ${token}` };
  } catch (error) {
    console.error('Error reading session from localStorage:', error);
    return {};
  }
};

/**
 * Get JWT authentication headers if available
 * SSR-safe: returns empty object on server
 */
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};

  try {
    const authToken = sessionStorage.getItem(
      process.env.NEXT_PUBLIC_AUTH_TOKEN_SS_KEY || 'auth-token',
    );

    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  } catch (error) {
    console.error('Error reading auth token from sessionStorage:', error);
    return {};
  }
};

/**
 * Middleware operation
 * If we have a session token in localStorage, add it to the GraphQL request as a Session header.
 */
export const middleware = new ApolloLink(async (operation, forward) => {
  const headers = {
    ...getSessionHeaders(),
    ...getAuthHeaders(),
  };

  operation.setContext({ headers });

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

    if (session && typeof window !== 'undefined') {
      try {
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
      } catch (error) {
        console.error('Error saving session to localStorage:', error);
      }
    }

    return response;
  }),
);

const clientSide = typeof window === 'undefined';

// Decide whether to use mock link
const useMocks =
  (process.env.NEXT_PUBLIC_ENABLE_MOCKS || '').toString().toLowerCase() ===
    'true' || !process.env.NEXT_PUBLIC_GRAPHQL_URL;

const link = useMocks
  ? mockLink
  : (() => {
      // Logging link for Apollo (development only)
      const loggerLink = new ApolloLink((operation, forward) => {
        // Helper to safely stringify objects (handles circular refs)
        const safeStringify = (obj) => {
          try {
            const seen = new WeakSet();
            return JSON.stringify(
              obj,
              function (key, value) {
                if (typeof value === 'function') {
                  return value.toString();
                }
                if (typeof value === 'object' && value !== null) {
                  if (seen.has(value)) return '[Circular]';
                  seen.add(value);
                }
                return value;
              },
              2,
            );
          } catch (e) {
            try {
              return String(obj);
            } catch (e2) {
              return '[unserializable]';
            }
          }
        };
        if (
          process.env.NODE_ENV === 'development' &&
          typeof window !== 'undefined'
        ) {
          try {
            console.groupCollapsed('[MEBL][apollo] ' + operation.operationName);
            console.log('Operation:', operation.operationName);
            console.log('Variables:', safeStringify(operation.variables));
            console.log(
              'Context Headers:',
              safeStringify(operation.getContext().headers),
            );
            console.groupEnd();
          } catch (err) {
            if (
              process.env.NODE_ENV === 'development' &&
              typeof window !== 'undefined'
            ) {
              console.warn('[MEBL][apollo] logger preflight error', err);
            }
          }
        }

        // forward(operation) may return an Observable-like or a Promise; normalize to Observable
        try {
          const forwarded = forward ? forward(operation) : null;

          if (!forwarded || typeof forwarded.subscribe !== 'function') {
            // If it's not subscribable, just return as-is
            return forwarded;
          }

          return new Observable((observer) => {
            const subscription = forwarded.subscribe({
              next: (response) => {
                if (
                  process.env.NODE_ENV === 'development' &&
                  typeof window !== 'undefined'
                ) {
                  try {
                    console.log(
                      '[MEBL][apollo] Response for',
                      operation.operationName,
                      safeStringify(response),
                    );
                  } catch (err) {
                    console.warn('[MEBL][apollo] logger response error', err);
                  }
                }
                observer.next(response);
              },
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });

            return () => {
              if (
                subscription &&
                typeof subscription.unsubscribe === 'function'
              ) {
                subscription.unsubscribe();
              }
            };
          });
        } catch (e) {
          return forward ? forward(operation) : null;
        }
      });

      return loggerLink.concat(
        middleware.concat(
          afterware.concat(
            createHttpLink({
              uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
              fetch,
              credentials: 'include', // Include cookies for authentication
            }),
          ),
        ),
      );
    })();

// Apollo GraphQL client.
const client = new ApolloClient({
  ssrMode: clientSide,
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          cart: {
            merge: true,
          },
        },
      },
    },
  }),
});

// Log configuration status in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const algoliaConfigured =
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID &&
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID !== 'changeme';

  console.info('[MEBL] Configuration status:');
  console.info(
    `  - GraphQL: ${useMocks ? '🔶 Using mocks' : '✅ Connected to ' + process.env.NEXT_PUBLIC_GRAPHQL_URL}`,
  );
  console.info(
    `  - Algolia Search: ${algoliaConfigured ? '✅ Configured' : '⚠️  Not configured (search disabled)'}`,
  );
}

export default client;
