import { request } from 'graphql-request';
import useSWR from 'swr';

import Categories from 'components/Category/Categories.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { FETCH_ALL_CATEGORIES_QUERY } from 'const/GQL_QUERIES';
import { WOO_CONFIG } from 'config/nextConfig';

const CategoryPage = () => {
  const { data, error } = useSWR(FETCH_ALL_CATEGORIES_QUERY, (query) =>
    request(WOO_CONFIG.GRAPHQL_URL, query)
  );
  console.log('Data:');
  console.log(data);
  console.log('Error:');
  console.log(error);

  return (
    <>
      {data ? (
        <Categories categories={data} />
      ) : (
        <div>{!error && <div className="h-64 mt-20"><LoadingSpinner /></div>}</div>
      )}

      {/* Display error message if error occured */}
      {error && (
        <div className="mt-8 text-2xl text-center">
          Feil under lasting av kategorier ...
        </div>
      )}
      {!data && (
        <div className="mt-8 text-2xl text-center">
          Feil under lasting av kategorier ...
        </div>
      )}
    </>
  );
};

export default CategoryPage;
