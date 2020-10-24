import Header from 'components/Header/Header.component';
import Hero from 'components/Index/Hero.component';
import IndexProducts from 'components/Product/IndexProducts.component';
import PageTitle from 'components/Title/PageTitle.component';

import client from 'utils/apollo/ApolloClient.js';

import { FETCH_ALL_PRODUCTS_QUERY } from 'utils/gql/GQL_QUERIES';

/**
 * Main index page
 * @param {Object} products
 * Initial static data is sent as props from getStaticProps and loaded through 'utils/gql/INITIAL_PRODUCTS'
 */
const HomePage = ({ products }) => {
  return (
    <>
      <Header title="- Forside" />
      <Hero />
      <PageTitle title="Produkter" />
      {products && <IndexProducts products={products} />}
    </>
  );
};

export default HomePage;

export async function getStaticProps() {
  const { data, loading, networkStatus } = await client.query({
    query: FETCH_ALL_PRODUCTS_QUERY,
  });

  return {
    props: {
      products: data.products.nodes,
      loading: loading,
      networkStatus: networkStatus,
    },
    revalidate: 10,
  };
}
