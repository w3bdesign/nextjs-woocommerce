import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState, useEffect } from 'react';

import SearchResults from './SearchResults.component';

// Check if Algolia is properly configured
const isAlgoliaConfigured = () => {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY;
  return appId && apiKey && appId !== 'changeme' && apiKey !== 'changethis';
};

const searchClient = isAlgoliaConfigured()
  ? algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY!,
    )
  : null;

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [hasFocus, sethasFocus] = useState<boolean>(false);

  useEffect(() => {
    if (!isAlgoliaConfigured()) {
      console.warn(
        'Algolia search is not configured. Please set NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY in your .env.local file.',
      );
    }
  }, []);

  // If Algolia is not configured, don't render the search box
  if (!searchClient) {
    return null;
  }

  return (
    <div className="inline mt-4 md:hidden">
      <InstantSearch
        indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'changeme'}
        searchClient={searchClient}
      >
        <SearchBox
          aria-label="Search here"
          translations={{
            submitTitle: 'Search',
            resetTitle: 'Clear search text',
            placeholder: 'Search for products',
          }}
          className={`w-full px-4 py-2 text-base bg-white border outline-none rounded ${
            hasFocus ? 'border-black' : 'border-gray-400'
          }`}
          onReset={() => {
            setSearch(null);
          }}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            sethasFocus(true);
            setSearch(target.value);
          }}
          onKeyDown={(event) => {
            const target = event.target as HTMLInputElement;
            sethasFocus(true);
            setSearch(target.value);
          }}
        />
        {search && <Hits hitComponent={SearchResults} />}
      </InstantSearch>
    </div>
  );
};

export default MobileSearch;
