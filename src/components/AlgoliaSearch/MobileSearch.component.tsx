import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, useSearchBox } from 'react-instantsearch';
import { useState } from 'react';

import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? 'changethis',
  process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? 'changethis',
);

/**
 * Custom SearchBox wrapper to track query state
 */
const CustomSearchBox = () => {
  const { query } = useSearchBox();
  const [hasFocus, setHasFocus] = useState<boolean>(false);

  return (
    <>
      <SearchBox
        placeholder="Søk etter produkter"
        translations={{
          submitButtonTitle: 'Søk',
          resetButtonTitle: 'Slett søketekst',
        }}
        classNames={{
          root: '',
          form: '',
          input: `px-4 py-2 text-base bg-surface border outline-none rounded-md transition-colors duration-200 ${
            hasFocus ? 'border-primary' : 'border-border'
          }`,
        }}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
      />
      {query && <Hits hitComponent={SearchResults} />}
    </>
  );
};

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
  return (
    <div className="inline mt-4 md:hidden">
      <InstantSearch
        indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'changeme'}
        searchClient={searchClient}
      >
        <CustomSearchBox />
      </InstantSearch>
    </div>
  );
};

export default MobileSearch;
