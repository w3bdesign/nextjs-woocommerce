import { request } from 'graphql-request';
import useSWR from 'swr';

import Hero from 'components/Index/Hero.component';
import IndexProducts from 'components/Product/IndexProducts.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { FETCH_ALL_PRODUCTS_QUERY } from 'const/GQL_QUERIES';
import { INITIAL_PRODUCTS } from 'const/INITIAL_PRODUCTS';
import { WOO_CONFIG } from 'config/nextConfig';

const HomePage = (props) => {
  const initialData = props;
  const { data, error } = useSWR(
    FETCH_ALL_PRODUCTS_QUERY,
    (query) => request(WOO_CONFIG.GRAPHQL_URL, query),
    { initialData }
  );

  return (
    <>
      <Hero />

      {data && <IndexProducts products={data} />}

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

export async function getStaticProps() {
  // Default products to display on front page
  return {
    props: INITIAL_PRODUCTS, // will be passed to the page component as props
  };
}
