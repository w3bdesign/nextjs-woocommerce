// Imports
import { withRouter } from 'next/router';

// Components
import SingleProduct from '@/components/Product/SingleProduct.component';
import Layout from '@/components/Layout/Layout.component';

// Utilities
import client from '@/utils/apollo/ApolloClient';

// Types
import type {
  NextPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from 'next';

// GraphQL
import { GET_SINGLE_PRODUCT } from '@/utils/gql/GQL_QUERIES';

/**
 * Display a single product with dynamic pretty urls
 * @function Produkt
 * @param {InferGetServerSidePropsType<typeof getServerSideProps>} products
 * @returns {JSX.Element} - Rendered component
 */
const Produkt: NextPage = ({
  product,
  networkStatus,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const hasError = networkStatus === '8';
  return (
    <>
      <Layout title={`${product.name ? product.name : ''}`}>
        {product ? (
          <SingleProduct product={product} />
        ) : (
          <div className="mt-8 text-2xl text-center">Laster produkt ...</div>
        )}
        {hasError && (
          <div className="mt-8 text-2xl text-center">
            Feil under lasting av produkt ...
          </div>
        )}
      </Layout>
    </>
  );
};

export default withRouter(Produkt);

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
}) => {
  const { data, loading, networkStatus } = await client.query({
    query: GET_SINGLE_PRODUCT,
    variables: { id },
  });

  return {
    props: { product: data.product, loading, networkStatus },
  };
};
