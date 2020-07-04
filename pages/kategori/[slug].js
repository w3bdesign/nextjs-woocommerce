import { withRouter } from 'next/router';

import IndexProducts from 'components/Product/IndexProducts.component';
import PageTitle from 'components/Header/PageTitle.component';

import client from 'utils/apollo/ApolloClient';

import { GET_PRODUCTS_FROM_CATEGORY } from 'utils/const/GQL_QUERIES';

/**
 * Display a single product with dynamic pretty urls
 */
const Produkt = ({ categoryName, products }) => {
 

  const error = false;

  return (
    <>
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
