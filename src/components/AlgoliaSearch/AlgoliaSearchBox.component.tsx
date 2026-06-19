import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, useSearchBox } from 'react-instantsearch';
import { useState } from 'react';

import SearchResults from './SearchResults.component';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? 'changeme',
  process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? 'changeme',
);

// https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/

/**
 * Custom SearchBox wrapper to track query state
 */
const CustomSearchBox = () => {
  const { query } = useSearchBox();
  const [hasFocus, setHasFocus] = useState<boolean>(false);

  return (
    <>
      <SearchBox
        aria-label="Søk her"
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
      {query && (
        <div className="absolute z-50 bg-surface shadow-lg rounded-md mt-1 md:w-[18rem]">
          <Hits hitComponent={SearchResults} />
        </div>
      )}
    </>
  );
};

/**
 * Displays Algolia search for larger resolutions that do not show the mobile menu
 */
const AlgoliaSearchBox = () => {
  return (
    <div className="hidden mb-0.5 md:inline-block xl:inline-block">
      <div className="relative w-72">
        <InstantSearch
          indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'changeme'}
          searchClient={searchClient}
        >
          {/*We need to conditionally add a border because the element has position:fixed*/}
          <CustomSearchBox />
        </InstantSearch>
      </div>
    </div>
  );
};

export default AlgoliaSearchBox;
