import { algoliasearch } from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import SearchResults from './SearchResults.component';

// Validate required environment variables
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

if (!ALGOLIA_APP_ID) {
  throw new Error(
    'NEXT_PUBLIC_ALGOLIA_APP_ID environment variable is required',
  );
}
if (!ALGOLIA_API_KEY) {
  throw new Error(
    'NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY environment variable is required',
  );
}
if (!ALGOLIA_INDEX_NAME) {
  throw new Error(
    'NEXT_PUBLIC_ALGOLIA_INDEX_NAME environment variable is required',
  );
}

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

// https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/

/**
 * Displays Algolia search for larger resolutions that do not show the mobile menu
 */
const AlgoliaSearchBox = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [hasFocus, sethasFocus] = useState<boolean>(false);

  return (
    <div className="hidden mb-0.5 md:inline xl:inline">
      <div className="">
        <InstantSearch
          indexName={ALGOLIA_INDEX_NAME}
          searchClient={searchClient}
        >
          {/*We need to conditionally add a border because the element has position:fixed*/}
          <SearchBox
            aria-label="Søk her"
            translations={{
              submitTitle: 'Søk',
              resetTitle: 'Slett søketekst',
              placeholder: 'Søk etter produkter',
            }}
            className={`px-4 py-2 text-base bg-surface border outline-none rounded-md transition-colors duration-200 ${
              hasFocus ? 'border-primary' : 'border-border'
            }`}
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
            onReset={() => {
              setSearch(null);
            }}
          />
          {search && (
            <div className="absolute z-50 bg-surface shadow-lg rounded-md mt-1 md:w-[18rem]">
              <Hits hitComponent={SearchResults} />
            </div>
          )}
        </InstantSearch>
      </div>
    </div>
  );
};

export default AlgoliaSearchBox;
