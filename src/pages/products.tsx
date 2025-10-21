import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';
import ProductGrid from '@/components/Product/ProductGrid.component';
import client from '@/utils/apollo/ApolloClient';
import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from 'next';

const Products: NextPage = ({
  products,
  loading,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (loading)
    return (
      <Layout title="Products">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="w-full aspect-[3/4]" />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );

  if (!products)
    return (
      <Layout title="Products">
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-red-500">No products found</p>
        </div>
      </Layout>
    );

  return (
    <Layout title="Products">
      <Head>
        <title>Products | Furniture Store</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <ProductGrid
          products={products}
          title="Furniture Collection"
          showFilters={true}
          showSorting={true}
        />
      </div>
    </Layout>
  );
};

export default Products;

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
