import Hero from 'components/Index/Hero.component';
import IndexProducts from 'components/Product/IndexProducts.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';

import { FETCH_ALL_PRODUCTS_QUERY } from 'utils/const/GQL_QUERIES';
import client from 'utils/apollo/ApolloClient.js';

/**
 * Main index page
 * @param {Object} props
 * Initial static data is sent as props from getStaticProps and loaded through 'utils/const/INITIAL_PRODUCTS'
 */
const HomePage = ({ products, loading, networkStatus }) => {
  return (
    <>
      <Hero />
      {products && <IndexProducts products={products} />}

      {
        // TODO
        // Add Hoodies section here
      }

      {loading && (
        <div className="h-64 mt-8 text-2xl text-center">
          Laster produkter ...
          <br />
          <LoadingSpinner />
        </div>
      )}
      {/* Display error message if error occured */}
      {networkStatus === 8 && (
        <div className="h-12 mt-8 text-2xl text-center">
          Feil under lasting av produkter ...
        </div>
      )}
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

  //console.log("getServerSideProps data: ")
  //console.log(data)
  console.log('getServerSideProps networkStatus: ');
  console.log(networkStatus);
  console.log('getServerSideProps loading: ');
  console.log(loading);

  return {
    props: {
      // products: result.data.products.nodes,
      products: data.products.nodes,
      loading: loading,
      networkStatus: networkStatus,
    },
  };
}
