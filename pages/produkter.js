import IndexProducts from 'components/Product/IndexProducts.component';
import PageTemplate from 'components/PageTemplate/PageTemplate.component';

import { FETCH_ALL_PRODUCTS_QUERY } from 'utils/gql/GQL_QUERIES';

import client from 'utils/apollo/ApolloClient.js';

/**
 * Displays all of the products.
 * Uses Apollo for data-fetching and caching.
 * Displays loading spinner while loading.
 * Shows an error if the server is down or unreachable.
 */
const Produkter = ({ products }) => {
  return (
    <>
      <PageTemplate title="Produkter" input={products}>
        {products && <IndexProducts products={products} />}
      </PageTemplate>
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
