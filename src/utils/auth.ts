import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { LOGIN_USER, REFRESH_AUTH_TOKEN } from './gql/GQL_MUTATIONS';

const AUTH_TOKEN_KEY =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_SS_KEY || 'auth-token';
const REFRESH_TOKEN_KEY =
  process.env.NEXT_PUBLIC_REFRESH_TOKEN_LS_KEY || 'refresh-token';

const GET_VIEWER_QUERY = gql`
  query GetViewer {
    viewer {
      id
      name
      email
    }
  }
`;

export interface LoginResponse {
  authToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Check if user has valid credentials
export async function hasCredentials(): Promise<boolean> {
  const token = getAuthToken();

  if (!token) {
    // Try to refresh token
    const newToken = await refreshAuthToken();
    return !!newToken;
  }

  // Verify token is valid
  const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const { data } = await client.query({
      query: GET_VIEWER_QUERY,
      fetchPolicy: 'network-only',
    });

    return !!data?.viewer?.id;
  } catch {
    // Token invalid, try refresh
    const newToken = await refreshAuthToken();
    return !!newToken;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export async function refreshAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    cache: new InMemoryCache(),
  });

  try {
    const { data } = await client.mutate({
      mutation: REFRESH_AUTH_TOKEN,
      variables: { refreshToken },
    });

    const newAuthToken = data?.refreshJwtAuthToken?.authToken;
    if (newAuthToken) {
      sessionStorage.setItem(AUTH_TOKEN_KEY, newAuthToken);
      return newAuthToken;
    }
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear invalid tokens
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }
}

function getErrorMessage(error: any): string {
  // Check for GraphQL errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0];
    const message = graphQLError.message;

    // Map GraphQL error messages to user-friendly messages
    switch (message) {
      case 'invalid_username':
        return 'Invalid username or email address. Please check and try again.';
      case 'incorrect_password':
        return 'Incorrect password. Please check your password and try again.';
      case 'invalid_email':
        return 'Invalid email address. Please enter a valid email address.';
      case 'empty_username':
        return 'Please enter a username or email address.';
      case 'empty_password':
        return 'Please enter a password.';
      case 'too_many_retries':
        return 'Too many failed attempts. Please wait a moment before trying again.';
      default:
        return 'Login failed. Please check your credentials and try again.';
    }
  }

  // Check for network errors
  if (error.networkError) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Fallback for other errors
  if (error.message) {
    return 'An error occurred during login. Please try again.';
  }

  return 'An unknown error occurred. Please try again later.';
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    cache: new InMemoryCache(),
  });

  try {
    const { data, errors } = await client.mutate({
      mutation: LOGIN_USER,
      variables: { username, password },
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Login failed');
    }

    if (!data?.login?.authToken) {
      throw new Error('Invalid credentials');
    }

    // Store tokens
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(AUTH_TOKEN_KEY, data.login.authToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.login.refreshToken);
    }

    return data.login;
  } catch (error: unknown) {
    const userFriendlyMessage = getErrorMessage(error);
    throw new Error(userFriendlyMessage);
  }
}

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Clear tokens
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(
    process.env.NEXT_PUBLIC_SESSION_TOKEN_LS_KEY || 'session-token',
  );

  // Redirect to home page
  window.location.href = '/';
}
