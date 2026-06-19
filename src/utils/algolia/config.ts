import { algoliasearch, SearchClient } from 'algoliasearch';

// Environment variables
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

// Check if Algolia is properly configured
const isConfigured = Boolean(ALGOLIA_APP_ID && ALGOLIA_API_KEY && ALGOLIA_INDEX_NAME);

// Warn in development if Algolia is not configured
if (process.env.NODE_ENV === 'development' && !isConfigured) {
  console.warn('Algolia: Configuration incomplete. Search functionality will be disabled.');
  if (!ALGOLIA_APP_ID) console.warn('  - NEXT_PUBLIC_ALGOLIA_APP_ID is missing');
  if (!ALGOLIA_API_KEY) console.warn('  - NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY is missing');
  if (!ALGOLIA_INDEX_NAME) console.warn('  - NEXT_PUBLIC_ALGOLIA_INDEX_NAME is missing');
}

// Lazy initialization of search client
let _searchClient: SearchClient | null = null;

export const getSearchClient = (): SearchClient | null => {
  if (!isConfigured) {
    return null;
  }
  
  if (!_searchClient) {
    _searchClient = algoliasearch(ALGOLIA_APP_ID!, ALGOLIA_API_KEY!);
  }
  
  return _searchClient;
};

// Export index name
export const indexName = ALGOLIA_INDEX_NAME || '';

// Export configuration status
export const isAlgoliaConfigured = isConfigured;
