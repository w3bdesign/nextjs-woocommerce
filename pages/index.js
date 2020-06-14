import Hero from 'components/Index/Hero.component';
import IndexProducts from 'components/Product/IndexProducts.component';
import client from 'utils/apollo/ApolloClient.js';

import { FETCH_ALL_PRODUCTS_QUERY } from 'utils/const/GQL_QUERIES';

/**
 * Main index page
 * @param {Object} products
 * Initial static data is sent as props from getStaticProps and loaded through 'utils/const/INITIAL_PRODUCTS'
 */
const HomePage = ({ products }) => {
  return (
    <>
    
      <Hero/>
      {products && <IndexProducts products={products} />}
    </>
  );
};

export default HomePage;

//export async function getStaticProps() {
export async function getServerSideProps() {
  const { data, loading, networkStatus } = await client.query({
    //const result = await client.query({
    query: FETCH_ALL_PRODUCTS_QUERY,
  });

  return {
    props: {
      products: data.products.nodes,
      loading: loading,
      networkStatus: networkStatus,
    },
  };
}
