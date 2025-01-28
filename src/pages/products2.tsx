import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';
import ProductList from '@/components/Product/ProductList.component';
import client from '@/utils/apollo/ApolloClient';
import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from 'next';
import { Product } from '@/types/product';

const Products2: NextPage = ({
  products,
  loading,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (loading)
    return (
      <Layout title="Produkter">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );

  if (!products)
    return (
      <Layout title="Produkter">
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-red-500">Ingen produkter funnet</p>
        </div>
      </Layout>
    );

  return (
    <Layout title="Produkter">
      <Head>
        <title>Produkter | WooCommerce Next.js</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <ProductList products={products} title="Herreklær" />
      </div>
    </Layout>
  );
};

export default Products2;

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
