import { withRouter } from 'next/router';

import Header from 'components/Header/Header.component';
import IndexProducts from 'components/Product/IndexProducts.component';
import PageTitle from 'components/Title/PageTitle.component';

import client from 'utils/apollo/ApolloClient';

import { GET_PRODUCTS_FROM_CATEGORY } from 'utils/gql/GQL_QUERIES';

/**
 * Display a single product with dynamic pretty urls
 */
const Produkt = ({ categoryName, products }) => {
  let error = false;

  return (
    <>
      <Header title={`- ${categoryName ? categoryName : ''}`} />
      {products ? (
        <>
          <PageTitle title={categoryName} marginleft="50" />
          <IndexProducts products={products} />
        </>
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

export async function getServerSideProps(context) {
  let {
    query: { id },
  } = context;

  const res = await client.query({
    query: GET_PRODUCTS_FROM_CATEGORY,
    variables: { id },
  });

  return {
    props: {
      categoryName: res.data.productCategory.name,
      products: res.data.productCategory.products.nodes,
    },
  };
}
