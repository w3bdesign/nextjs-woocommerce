import { ApolloClient, InMemoryCache } from '@apollo/client';
import { LOGIN_USER } from './gql/GQL_MUTATIONS';

type LoginError = {
  graphQLErrors?: Array<{ message?: string }>;
  networkError?: unknown;
  message?: string;
};

const GRAPHQL_ERROR_MESSAGES: Record<string, string> = {
  invalid_username:
    'Ugyldig brukernavn eller e-postadresse. Vennligst sjekk og prøv igjen.',
  incorrect_password:
    'Feil passord. Vennligst sjekk passordet ditt og prøv igjen.',
  invalid_email:
    'Ugyldig e-postadresse. Vennligst skriv inn en gyldig e-postadresse.',
  empty_username: 'Vennligst skriv inn brukernavn eller e-postadresse.',
  empty_password: 'Vennligst skriv inn passord.',
  too_many_retries:
    'For mange mislykkede forsøk. Vennligst vent litt før du prøver igjen.',
};

const DEFAULT_GRAPHQL_ERROR =
  'Innlogging mislyktes. Vennligst sjekk dine opplysninger og prøv igjen.';
const NETWORK_ERROR =
  'Nettverksfeil. Vennligst sjekk internetttilkoblingen din og prøv igjen.';
const GENERIC_LOGIN_ERROR =
  'Det oppstod en feil under innlogging. Vennligst prøv igjen.';
const UNKNOWN_ERROR =
  'En ukjent feil oppstod. Vennligst prøv igjen senere.';

function getErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return UNKNOWN_ERROR;
  }

  const loginError = error as LoginError;

  // Check for GraphQL errors
  if (loginError.graphQLErrors && loginError.graphQLErrors.length > 0) {
    const message = loginError.graphQLErrors[0].message ?? '';
    return GRAPHQL_ERROR_MESSAGES[message] ?? DEFAULT_GRAPHQL_ERROR;
  }

  // Check for network errors
  if (loginError.networkError) {
    return NETWORK_ERROR;
  }

  // Fallback for other errors
  if (loginError.message) {
    return GENERIC_LOGIN_ERROR;
  }

  return UNKNOWN_ERROR;
}

export async function login(username: string, password: string) {
  try {
    const client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      cache: new InMemoryCache(),
      credentials: 'include', // Include cookies in requests
    });

    const { data } = await client.mutate({
      mutation: LOGIN_USER,
      variables: { username, password },
    });

    const loginResult = data.loginWithCookies;

    if (loginResult.status !== 'SUCCESS') {
      throw new Error(
        'Innlogging mislyktes. Vennligst sjekk dine opplysninger og prøv igjen.',
      );
    }

    // On successful login, cookies are automatically set by the server
    return { success: true, status: loginResult.status };
  } catch (error: unknown) {
    const userFriendlyMessage = getErrorMessage(error);
    throw new Error(userFriendlyMessage);
  }
}

/*
export async function logout() {
  // For cookie-based auth, we might need a logout mutation
  // For now, we can clear any client-side state
  if (typeof window !== 'undefined') {
    // Redirect to login or home page after logout
    window.location.href = '/';
  }
}
*/
