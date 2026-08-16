import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, useSearchBox } from 'react-instantsearch';
import { useState } from 'react';

import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? 'changeme',
  process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? 'changeme',
);

// https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/

/**
 * Custom SearchBox wrapper to track query state
 */
const CustomSearchBox = () => {
  const { query } = useSearchBox();
  const [hasFocus, setHasFocus] = useState<boolean>(false);

  return (
    <>
      {/* Search icon inside the input, left-aligned like larger e-commerce search bars */}
      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-text-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <SearchBox
        aria-label="Søk her"
        placeholder="Søk etter produkter"
        translations={{
          submitButtonTitle: 'Søk',
          resetButtonTitle: 'Slett søketekst',
        }}
        classNames={{
          root: '',
          form: '',
          input: `w-full pl-11 pr-4 py-2.5 text-base bg-surface border shadow-sm outline-none rounded-md transition-colors duration-200 ${
            hasFocus ? 'border-primary' : 'border-border hover:border-primary/60'
          }`,
        }}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
      />
      {query && (
        <div className="absolute left-0 right-0 top-full z-50 bg-surface shadow-lg rounded-md mt-1">
          <Hits hitComponent={SearchResults} />
        </div>
      )}
    </>
  );
};

/**
 * Displays Algolia search for larger resolutions that do not show the mobile menu
 */
const AlgoliaSearchBox = () => {
  return (
    <div className="hidden mb-0.5 md:block md:flex-1 md:max-w-xl md:mx-6">
      <div className="relative w-full">
        <InstantSearch
          indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'changeme'}
          searchClient={searchClient}
        >
          {/*We need to conditionally add a border because the element has position:fixed*/}
          <CustomSearchBox />
        </InstantSearch>
      </div>
    </div>
  );
};

export default AlgoliaSearchBox;
