import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';


import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_PUBLIC_API_KEY
);

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
  const [search, setSearch] = useState(null);
  const [hasFocus, sethasFocus] = useState(false);
  return (
    <div className="inline mt-4">
      <InstantSearch
        indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}
        searchClient={searchClient}
      >
        <SearchBox
          translations={{
            submitTitle: 'Søk',
            resetTitle: 'Slett søketekst',
            placeholder: 'Søk etter produkter',
          }}
          className={`px-4 py-2 text-base bg-white border outline-none rounded ${
            hasFocus ? 'border-black' : 'border-gray-400'
          }`}
          onFocus={() => {
            sethasFocus(true);
          }}
          onBlur={() => {
            sethasFocus(false);
          }}
          onReset={() => {
            setSearch(null);
          }}
          onChange={(text) => {
            setSearch(text.target.value);
          }}
        />
        {search && <Hits className="absolute" hitComponent={SearchResults} />}
      </InstantSearch>
    </div>
  );
};

export default MobileSearch;
