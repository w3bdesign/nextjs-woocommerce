import { request } from 'graphql-request';
import useSWR from 'swr';

import Categories from 'components/Category/Categories.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { FETCH_ALL_CATEGORIES_QUERY } from 'utils/const/GQL_QUERIES';
import { WOO_CONFIG } from 'utils/config/nextConfig';

/**
 * Category page displays all of the categories
 */
const CategoryPage = () => {
  const { data, error } = useSWR(FETCH_ALL_CATEGORIES_QUERY, (query) =>
    request(WOO_CONFIG.GRAPHQL_URL, query)
  );


  return (
    <>
      {data && (
        <Categories categories={data} />
      )}

      {!data && !error && (
        <div className="h-64 mt-8 text-2xl text-center">
          Laster ...
          <br />
          <LoadingSpinner />
        </div>
      )}

      {/* Display error message if error occured */}
      {error && (
        <div className="h-12 mt-20 text-2xl text-center">
          Feil under lasting av kategorier ...
        </div>
      )}

    </>
  );
};

export default CategoryPage;
