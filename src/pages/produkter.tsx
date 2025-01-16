import DisplayProducts from '@/components/Product/DisplayProducts.component';
import Layout from '@/components/Layout/Layout.component';

// GraphQL
import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';

// Utilities
import client from '@/utils/apollo/ApolloClient';

// Types
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from 'next';

/**
 * Displays all of the products.
 * @function HomePage
 * @param {InferGetStaticPropsType<typeof getStaticProps>} products
 * @returns {JSX.Element} - Rendered component
 */

const Produkter: NextPage = ({
  products,
}: InferGetStaticPropsType<typeof getStaticProps>) => (
  <Layout title="Produkter">
    <div className="px-1">
      {products && <DisplayProducts products={products} />}
    </div>
  </Layout>
);

export default Produkter;

export const getStaticProps: GetStaticProps = async () => {
  const { data, loading, networkStatus } = await client.query({
    query: FETCH_ALL_PRODUCTS_QUERY,
  });

  return {
    props: {
      products: data.products.nodes,
      loading,
      networkStatus,
    },
    revalidate: 60,
  };
};
