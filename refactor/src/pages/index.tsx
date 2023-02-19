import Hero from '@/components/Index/Hero.component';
//import IndexProducts from '@/components/Product/IndexProducts.component';
import Layout from '@/components/Layout/Layout.component';

import client from '@/utils/apollo/ApolloClient.js';

import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';

/**
 * Main index page
 * @param {Object} products
 * Initial static data is sent as props from getStaticProps and loaded through 'utils/gql/INITIAL_PRODUCTS'
 */
const HomePage = ({ products }: any) => (
  <>
    <Layout title="Hjem">
      <Hero />
    </Layout>
  </>
);

export default HomePage;

export async function getStaticProps() {
  const { data, loading, networkStatus } = await client.query({
    query: FETCH_ALL_PRODUCTS_QUERY,
  });

  return {
    props: {
      products: data.products.nodes,
      loading,
      networkStatus,
    },
    revalidate: 10,
  };
}
