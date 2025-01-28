import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';
import ProductCard from '@/components/Product/ProductCard.component';
import ProductFilters from '@/components/Product/ProductFilters.component';
import client from '@/utils/apollo/ApolloClient';
import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from 'next';

interface Image {
  __typename: string;
  sourceUrl?: string;
}

interface Node {
  __typename: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
}

interface Variations {
  __typename: string;
  nodes: Node[];
}

interface Product {
  __typename: string;
  databaseId: number;
  name: string;
  onSale: boolean;
  slug: string;
  image: Image;
  price: string;
  regularPrice: string;
  salePrice?: string;
  variations: Variations;
}

const Products2: NextPage = ({
  products,
  loading,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  if (loading) return (
    <Layout title="Produkter">
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    </Layout>
  );

  if (!products) return (
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
        <div className="flex flex-col md:flex-row gap-8">
          <ProductFilters
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-medium">
                Herreklær <span className="text-gray-500">({products.length})</span>
              </h1>

              <div className="flex items-center gap-4">
                <label className="text-sm">Vis produkter:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-1"
                >
                  <option value="popular">Populær</option>
                  <option value="price-low">Pris: Lav til Høy</option>
                  <option value="price-high">Pris: Høy til Lav</option>
                  <option value="newest">Nyeste</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: Product) => (
                <ProductCard
                  key={product.databaseId}
                  databaseId={product.databaseId}
                  name={product.name}
                  price={product.price}
                  slug={product.slug}
                  image={product.image}
                />
              ))}
            </div>
          </div>
        </div>
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
