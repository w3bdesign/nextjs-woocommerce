import { request } from 'graphql-request';
import useSWR from 'swr';

import IndexProducts from 'components/Product/IndexProducts.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { FETCH_ALL_PRODUCTS_QUERY } from 'utils/const/GQL_QUERIES';
import { WOO_CONFIG } from 'utils/config/nextConfig';

/**
 * Displays all of the products.
 * Uses useSWR for data-fetching and caching.
 * Displays loading spinner while loading.
 * Shows an error if the server is down or unreachable.
 */
const Produkter = () => {
  const { data, error } = useSWR(
    FETCH_ALL_PRODUCTS_QUERY,
    (query) => request(WOO_CONFIG.GRAPHQL_URL, query),
    { refreshInterval: 3600000 }
  ); // Refresh once every hour

  return (
    <>
      {data && <IndexProducts products={data} />}

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
          Feil under lasting av produkter ...
        </div>
      )}
    </>
  );
};

export default Produkter;
