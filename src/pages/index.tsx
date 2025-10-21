// Components
import Hero from '@/components/Index/Hero.component';
import ProductGrid from '@/components/Product/ProductGrid.component';
import Layout from '@/components/Layout/Layout.component';

// Utilities
import client from '@/utils/apollo/ApolloClient';

// Types
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from 'next';

// GraphQL
import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';

/**
 * Main index page
 * @function Index
 * @param {InferGetStaticPropsType<typeof getStaticProps>} products
 * @returns {JSX.Element} - Rendered component
 */

const Index: NextPage = ({
  products,
}: InferGetStaticPropsType<typeof getStaticProps>) => (
  <Layout title="Home">
    <Hero />
    {products && (
      <section className="container mx-auto bg-white py-12">
        <ProductGrid
          products={products}
          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        />
      </section>
    )}
  </Layout>
);

export default Index;

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
