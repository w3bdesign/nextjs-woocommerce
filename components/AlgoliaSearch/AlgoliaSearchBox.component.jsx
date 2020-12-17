import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import WOO_CONFIG from 'utils/config/nextConfig';
import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  // WOO_CONFIG.ALGOLIA_APP_ID,
  // WOO_CONFIG.ALGOLIA_PUBLIC_API_KEY
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_PUBLIC_API_KEY
);

// https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/

/**
 * Displays Algolia search for larger resolutions that do not show the mobile menu
 */
const AlgoliaSearchBox = () => {
  const [search, setSearch] = useState(null);
  const [hasFocus, sethasFocus] = useState(false);

  return (
    <>
      <div className="hidden mt-2 md:inline xl:inline">
        <div className="">
          <InstantSearch
            indexName={WOO_CONFIG.ALGOLIA_INDEX_NAME}
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
            {search && (
              <Hits className="absolute" hitComponent={SearchResults} />
            )}
          </InstantSearch>
        </div>
      </div>
    </>
  );
};

export default AlgoliaSearchBox;
