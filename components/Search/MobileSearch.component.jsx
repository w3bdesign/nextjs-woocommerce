import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import { WOO_CONFIG } from 'utils/config/nextConfig';
import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  WOO_CONFIG.ALGOLIA_APP_ID,
  WOO_CONFIG.ALGOLIA_PUBLIC_API_KEY
);

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
  const [search, setSearch] = useState(null);
  const [hasFocus, sethasFocus] = useState(false);
  return (
    <>
      <div className="inline mt-4">
        <InstantSearch indexName="wp_posts_product" searchClient={searchClient}>
          <SearchBox
            translations={{
              submitTitle: 'Søk',
              resetTitle: 'Slett søketekst',
              placeholder: 'Søk her ...',
            }}
            className={`px-4 py-2 text-base bg-gray-100 border outline-none rounded ${
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
    </>
  );
};

export default MobileSearch;
