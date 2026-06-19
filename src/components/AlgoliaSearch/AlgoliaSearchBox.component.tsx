import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { useState, type ChangeEvent, type KeyboardEvent } from 'react';

import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? 'changeme',
  process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? 'changeme',
);

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
          indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'changeme'}
          searchClient={searchClient}
        >
          {/*We need to conditionally add a border because the element has position:fixed*/}
          <SearchBox
            aria-label="Søk her"
            placeholder="Søk etter produkter"
            translations={{
              submitButtonTitle: 'Søk',
              resetButtonTitle: 'Slett søketekst',
            }}
            className={`px-4 py-2 text-base bg-surface border outline-none rounded-md transition-colors duration-200 ${
              hasFocus ? 'border-primary' : 'border-border'
            }`}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const target = event.target;
              sethasFocus(true);
              setSearch(target.value);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
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
