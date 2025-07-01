import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { LOGIN_USER, REFRESH_AUTH_TOKEN } from './gql/GQL_MUTATIONS';

let tokenSetter: NodeJS.Timeout;

export function hasCredentials() {
  const authToken = sessionStorage.getItem(
    process.env.NEXT_PUBLIC_AUTH_TOKEN_SS_KEY as string
  );
  const refreshToken = localStorage.getItem(
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_LS_KEY as string
  );

  if (!!authToken && !!refreshToken) {
    return true;
  }

  return false;
}

export async function getAuthToken() {
  let authToken = sessionStorage.getItem(
    process.env.NEXT_PUBLIC_AUTH_TOKEN_SS_KEY as string
  );
  if (!authToken || !tokenSetter) {
    authToken = await fetchAuthToken();
  }
  return authToken;
}

async function fetchAuthToken() {
  const refreshToken = localStorage.getItem(
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_LS_KEY as string
  );
  if (!refreshToken) {
    // No refresh token means the user is not authenticated.
    return;
  }

  try {
    const client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      cache: new InMemoryCache(),
    });

    const { data } = await client.mutate({
      mutation: REFRESH_AUTH_TOKEN,
      variables: { refreshToken },
    });

    const authToken = data?.refreshJwtAuthToken?.authToken;
    if (!authToken) {
      throw new Error('Failed to retrieve a new auth token');
    }
    // Save token.
    sessionStorage.setItem(
      process.env.NEXT_PUBLIC_AUTH_TOKEN_SS_KEY as string,
      authToken
    );
    if (tokenSetter) {
      clearInterval(tokenSetter);
    }
    tokenSetter = setInterval(
      async () => {
        if (!hasCredentials()) {
          clearInterval(tokenSetter);
          return;
        }
        fetchAuthToken();
      },
      Number(process.env.NEXT_PUBLIC_AUTH_KEY_TIMEOUT || 300000)
    );

    return authToken;
  } catch (err) {
    console.error(err);
  }
}

function saveCredentials(
  authToken: string,
  sessionToken: string,
  refreshToken: string | null = null
) {
  sessionStorage.setItem(
    process.env.NEXT_PUBLIC_AUTH_TOKEN_SS_KEY as string,
    authToken
  );
  sessionStorage.setItem(
    process.env.NEXT_PUBLIC_SESSION_TOKEN_LS_KEY as string,
    sessionToken
  );
  if (refreshToken) {
    localStorage.setItem(
      process.env.NEXT_PUBLIC_REFRESH_TOKEN_LS_KEY as string,
      refreshToken
    );
  }
}

export async function login(username: string, password: string) {
  const headers: { [key: string]: string } = {};
  const sessionToken = sessionStorage.getItem(
    process.env.NEXT_PUBLIC_SESSION_TOKEN_LS_KEY as string
  );
  if (sessionToken) {
    headers['woocommerce-session'] = `Session ${sessionToken}`;
  }
  try {
    const client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      cache: new InMemoryCache(),
      headers,
    });

    const { data } = await client.mutate({
      mutation: LOGIN_USER,
      variables: { username, password },
    });

    const { authToken, refreshToken, customer } = data.login;

    if (!authToken || !refreshToken || !customer.sessionToken) {
      throw new Error('Failed to retrieve credentials.');
    }
    saveCredentials(authToken, customer.sessionToken, refreshToken);
    return customer;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred during login.');
  }
}
