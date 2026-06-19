import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import SearchResults from './SearchResults.component';
import { getSearchClient, indexName, isAlgoliaConfigured } from '@/utils/algolia/config';

// https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/

/**
 * Displays Algolia search for larger resolutions that do not show the mobile menu
 */
const AlgoliaSearchBox = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [hasFocus, sethasFocus] = useState<boolean>(false);

  // Don't render if Algolia is not configured
  if (!isAlgoliaConfigured) {
    return null;
  }

  const searchClient = getSearchClient();

  if (!searchClient) {
    return null;
  }

  return (
    <div className="hidden mb-0.5 md:inline xl:inline">
      <div className="">
        <InstantSearch indexName={indexName} searchClient={searchClient}>
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
