import { withRouter } from 'next/router';

import SingleProduct from 'components/Product/SingleProduct.component';
import Header from 'components/Header/Header.component';

import client from 'utils/apollo/ApolloClient';

import { GET_SINGLE_PRODUCT } from 'utils/gql/GQL_QUERIES';

/**
 * Display a single product with dynamic pretty urls
 */
const Produkt = ({ product }) => {
  let error = false;

  return (
    <>
      <Header title={`- ${product.name ? product.name : ''}`} />
      {product ? (
        <SingleProduct product={product} />
      ) : (
        <div className="mt-8 text-2xl text-center">Laster produkt ...</div>
      )}
      {/* Display error message if error occured */}
      {error && (
        <div className="mt-8 text-2xl text-center">
          Feil under lasting av produkt ...
        </div>
      )}
    </>
  );
};

export default withRouter(Produkt);

export async function getServerSideProps({ query: { id } }) {
  const res = await client.query({
    query: GET_SINGLE_PRODUCT,
    variables: { id },
  });

  return {
    props: { product: res.data.product },
  };
}
