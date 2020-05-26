import { request } from 'graphql-request';
import useSWR from 'swr';

import Hero from 'components/Index/Hero.component';
import IndexProducts from 'components/Product/IndexProducts.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { FETCH_ALL_PRODUCTS_QUERY } from 'const/GQL_QUERIES';
import { WOO_CONFIG } from 'config/nextConfig';

const HomePage = () => {
  const { data, error } = useSWR(FETCH_ALL_PRODUCTS_QUERY, (query) =>
    request(WOO_CONFIG.GRAPHQL_URL, query)
  );

  return (
    <>
      <Hero />
      {data && <IndexProducts products={data} />}
      
      {!data && !error && (
        <div className="h-32 mt-8 text-2xl text-center">
          Laster produkter ...
          <br />
          <LoadingSpinner />
        </div>
      )}

      {/* Display error message if error occured */}
      {error && (
        <div className="h-12 mt-8 text-2xl text-center">
          Feil under lasting av produkter ...
        </div>
      )}
    </>
  );
};

export default HomePage;
