import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { useState } from 'react';

import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? 'changethis',
  process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? 'changethis',
);

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [hasFocus, sethasFocus] = useState<boolean>(false);
  return (
    <div className="inline mt-4 md:hidden">
      <InstantSearch
        indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'changeme'}
        searchClient={searchClient}
      >
        <SearchBox
          placeholder="Søk etter produkter"
          translations={{
            submitButtonTitle: 'Søk',
            resetButtonTitle: 'Slett søketekst',
          }}
          className={`px-4 py-2 text-base bg-surface border outline-none rounded-md transition-colors duration-200 ${
            hasFocus ? 'border-primary' : 'border-border'
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
