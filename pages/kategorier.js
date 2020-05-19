import { request } from 'graphql-request';
import useSWR from 'swr';

import Header from 'components/Header/Header.component';
import Categories from 'components/Category/Categories.component';

import { FETCH_ALL_CATEGORIES_QUERY } from 'const/GQL_QUERIES';
import { WOO_CONFIG } from 'config/nextConfig';

function CategoryPage() {
  const { data, error } = useSWR(FETCH_ALL_CATEGORIES_QUERY, (query) =>
    request(WOO_CONFIG.GRAPHQL_URL, query)
  );

  return (
    <>
      <Header />
      {data ? (
        <Categories categories={data} />
      ) : (
        <div className="mt-8 text-2xl text-center">Laster kategorier ...</div>
      )}

      {/* Display error message if error occured */}
      {error && (
        <div className="mt-8 text-2xl text-center">
          Feil under lasting av kategorier ...
        </div>
      )}
    </>
  );
}

export default CategoryPage;
