import Header from 'components/Header/Header.component';
import IndexProducts from 'components/Product/IndexProducts.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';
import PageTitle from 'components/Title/PageTitle.component';

import { FETCH_ALL_PRODUCTS_QUERY } from 'utils/const/GQL_QUERIES';

import client from 'utils/apollo/ApolloClient.js';

/**
 * Displays all of the products.
 * Uses Apollo for data-fetching and caching.
 * Displays loading spinner while loading.
 * Shows an error if the server is down or unreachable.
 */
const Produkter = ({ products }) => {
  const error = false;

  return (
    <>
      <Header title="- Produkter" />
      <PageTitle title="Produkter" marginleft="50" />

      {products && <IndexProducts products={products} />}

      {!products && !error && (
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

export async function getStaticProps() {
  const result = await client.query({
    query: FETCH_ALL_PRODUCTS_QUERY,
  });

  return {
    props: {
      products: result.data.products.nodes,
    },
    revalidate: 10,
  };
}
