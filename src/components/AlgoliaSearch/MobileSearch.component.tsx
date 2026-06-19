import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import SearchResults from './SearchResults.component';
import { getSearchClient, indexName, isAlgoliaConfigured } from '@/utils/algolia/config';

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
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
    <div className="inline mt-4 md:hidden">
      <InstantSearch indexName={indexName} searchClient={searchClient}>
        <SearchBox
          translations={{
            submitTitle: 'Søk',
            resetTitle: 'Slett søketekst',
            placeholder: 'Søk etter produkter',
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
