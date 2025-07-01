import { ApolloClient, InMemoryCache } from '@apollo/client';
import { LOGIN_USER } from './gql/GQL_MUTATIONS';

// Cookie-based authentication - no token storage needed
export function hasCredentials() {
  if (typeof window === 'undefined') {
    return false; // Server-side, no credentials available
  }
  
  // With cookie-based auth, we'll check if user is logged in through a query
  // For now, we'll return false and let components handle the check
  return false;
}

export async function getAuthToken() {
  // Cookie-based auth doesn't need JWT tokens
  return null;
}

function getErrorMessage(error: any): string {
  // Check for GraphQL errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0];
    const message = graphQLError.message;
    
    // Map GraphQL error messages to user-friendly messages
    switch (message) {
      case 'invalid_username':
        return 'Ugyldig brukernavn eller e-postadresse. Vennligst sjekk og prøv igjen.';
      case 'incorrect_password':
        return 'Feil passord. Vennligst sjekk passordet ditt og prøv igjen.';
      case 'invalid_email':
        return 'Ugyldig e-postadresse. Vennligst skriv inn en gyldig e-postadresse.';
      case 'empty_username':
        return 'Vennligst skriv inn brukernavn eller e-postadresse.';
      case 'empty_password':
        return 'Vennligst skriv inn passord.';
      case 'too_many_retries':
        return 'For mange mislykkede forsøk. Vennligst vent litt før du prøver igjen.';
      default:
        return 'Innlogging mislyktes. Vennligst sjekk dine opplysninger og prøv igjen.';
    }
  }
  
  // Check for network errors
  if (error.networkError) {
    return 'Nettverksfeil. Vennligst sjekk internetttilkoblingen din og prøv igjen.';
  }
  
  // Fallback for other errors
  if (error.message) {
    return 'Det oppstod en feil under innlogging. Vennligst prøv igjen.';
  }
  
  return 'En ukjent feil oppstod. Vennligst prøv igjen senere.';
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
      throw new Error('Innlogging mislyktes. Vennligst sjekk dine opplysninger og prøv igjen.');
    }

    // On successful login, cookies are automatically set by the server
    return { success: true, status: loginResult.status };
  } catch (error: unknown) {
    const userFriendlyMessage = getErrorMessage(error);
    throw new Error(userFriendlyMessage);
  }
}

export async function logout() {
  // For cookie-based auth, we might need a logout mutation
  // For now, we can clear any client-side state
  if (typeof window !== 'undefined') {
    // Redirect to login or home page after logout
    window.location.href = '/';
  }
}
