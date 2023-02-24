import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? 'changethis',
  process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? 'changethis'
);

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
  const [search, setSearch] = useState(null);
  //const [hasFocus, sethasFocus] = useState(false);
  return (
    <div className="inline mt-4 md:hidden">
      <InstantSearch
        indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'changeme'}
        searchClient={searchClient}
      >
        <SearchBox
          translations={{
            submitTitle: 'Søk',
            resetTitle: 'Slett søketekst',
            placeholder: 'Søk etter produkter',
          }}
          className={`px-4 py-2 text-base bg-white border outline-none rounded `}
          onReset={() => {
            setSearch(null);
          }}
          /*onChange={(text) => {
            setSearch(text.target.value);
          }}*/
        />
        {search && <Hits hitComponent={SearchResults} />}
      </InstantSearch>
    </div>
  );
};

export default MobileSearch;
