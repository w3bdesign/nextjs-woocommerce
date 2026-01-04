import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { IncomingMessage } from 'http';
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

/**
 * Custom error class for authentication failures
 * Includes optional field metadata to identify which form field caused the error
 */
export class AuthenticationError extends Error {
  field?: 'username' | 'password';

  constructor(message: string, field?: 'username' | 'password') {
    super(message);
    this.name = 'AuthenticationError';
    this.field = field;
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }
}

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

/**
 * Extract auth token from request for SSR
 * Checks cookies and Authorization header
 */
export function getAuthTokenFromRequest(req: IncomingMessage): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies for auth token
  const cookies = req.headers.cookie;
  if (cookies) {
    const authCookie = cookies
      .split(';')
      .find((c) => c.trim().startsWith(`${AUTH_TOKEN_KEY}=`));
    if (authCookie) {
      return authCookie.split('=')[1];
    }
  }

  return null;
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

function getErrorMessage(error: any): AuthenticationError {
  // Check for GraphQL errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0];
    const message = graphQLError.message;

    // Map GraphQL error messages to user-friendly messages with field metadata
    switch (message) {
      case 'invalid_username':
        return new AuthenticationError(
          'Invalid username or email address. Please check and try again.',
          'username',
        );
      case 'incorrect_password':
        return new AuthenticationError(
          'Incorrect password. Please check your password and try again.',
          'password',
        );
      case 'invalid_email':
        return new AuthenticationError(
          'Invalid email address. Please enter a valid email address.',
          'username',
        );
      case 'empty_username':
        return new AuthenticationError(
          'Please enter a username or email address.',
          'username',
        );
      case 'empty_password':
        return new AuthenticationError('Please enter a password.', 'password');
      case 'too_many_retries':
        return new AuthenticationError(
          'Too many failed attempts. Please wait a moment before trying again.',
        );
      default:
        return new AuthenticationError(
          'Login failed. Please check your credentials and try again.',
        );
    }
  }

  // Check for network errors
  if (error.networkError) {
    return new AuthenticationError(
      'Network error. Please check your internet connection and try again.',
    );
  }

  // Fallback for other errors
  if (error.message) {
    return new AuthenticationError(
      'An error occurred during login. Please try again.',
    );
  }

  return new AuthenticationError(
    'An unknown error occurred. Please try again later.',
  );
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
    const authError = getErrorMessage(error);
    throw authError;
  }
}

export async function logout(onSuccess?: () => void): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Clear tokens
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(
      process.env.NEXT_PUBLIC_SESSION_TOKEN_LS_KEY || 'session-token',
    );

    // Call success callback if provided (for toast notifications, state updates)
    if (onSuccess) {
      onSuccess();
    }

    // Small delay to allow toast to show before redirect
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even on error
    window.location.href = '/';
  }
}
