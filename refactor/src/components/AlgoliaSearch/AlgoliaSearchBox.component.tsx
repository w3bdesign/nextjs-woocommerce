import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? 'changeme',
  process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? 'changeme'
);

// https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/

/**
 * Displays Algolia search for larger resolutions that do not show the mobile menu
 */
const AlgoliaSearchBox = () => {
  const [search, setSearch] = useState(null);
  const [hasFocus, sethasFocus] = useState(false);

  return (
    <div className="hidden mt-2 md:inline xl:inline">
      <div className="">
        <InstantSearch
          indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "changeme"}
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
            /*onFocus={() => {
              sethasFocus(true);
            }}*/
           /* onBlur={() => {
              sethasFocus(false);
            }}*/
            onReset={() => {
              setSearch(null);
            }}
            /* onChange={(text) => {
              setSearch(text.target.value);
            }}*/
          />
          {search && <Hits hitComponent={SearchResults} />}


          <Hits hitComponent={SearchResults} />



        </InstantSearch>
      </div>
    </div>
  );
};

export default AlgoliaSearchBox;
