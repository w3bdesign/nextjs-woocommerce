import { request } from 'graphql-request';
import useSWR from 'swr';

import Hero from 'components/Index/Hero.component';
import IndexProducts from 'components/Product/IndexProducts.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { FETCH_ALL_PRODUCTS_QUERY } from 'utils/const/GQL_QUERIES';
import { INITIAL_PRODUCTS } from 'utils/const/INITIAL_PRODUCTS';
import { WOO_CONFIG } from 'utils/config/nextConfig';

/**
 * Main index page
 * @param {Object} props
 * Initial static data is sent as props from getStaticProps and loaded through 'utils/const/INITIAL_PRODUCTS'
 */
const HomePage = (props) => {
  const initialData = props;

  // TODO Should this be moved to the component that uses it,
  // TODO instead of fetching the data in index.js?
  // TODO We can still fetch a single product and use it to display errors

  const { data, error } = useSWR(
    FETCH_ALL_PRODUCTS_QUERY,
    (query) => request(WOO_CONFIG.GRAPHQL_URL, query),
    { refreshInterval: 3600000 }
  ); // Refresh once every hour

  return (
    <>
      <Hero />
      {data && <IndexProducts products={data} />}

      {
        // TODO
        // Add Hoodies section here
      }

      {!data && !error && (
        <div className="h-64 mt-8 text-2xl text-center">
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
