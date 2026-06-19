import { algoliasearch } from 'algoliasearch';

// Environment variables
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY || '';
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

// Warn in development if Algolia is not configured
if (process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
    console.warn('Algolia: NEXT_PUBLIC_ALGOLIA_APP_ID is not configured');
  }
  if (!process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY) {
    console.warn('Algolia: NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY is not configured');
  }
  if (!process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME) {
    console.warn('Algolia: NEXT_PUBLIC_ALGOLIA_INDEX_NAME is not configured');
  }
}

// Create Algolia search client
export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

// Export index name
export const indexName = ALGOLIA_INDEX_NAME;
