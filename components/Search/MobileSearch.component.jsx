import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import { WOO_CONFIG } from 'config/nextConfig';
import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  WOO_CONFIG.ALGOLIA_APP_ID,
  WOO_CONFIG.ALGOLIA_PUBLIC_API_KEY
);

const MobileSearch = () => {
  const [search, setSearch] = useState(null);
  return (
    <>
      <div className="inline mt-4">
      <InstantSearch
            indexName="wp_posts_product"
            searchClient={searchClient}
          >
            <SearchBox
              className="px-6 py-2 bg-white border border-gray-500 rounded-lg focus:outline-none focus:shadow-outline"
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
