import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';
import ProductCard from '@/components/Product/ProductCard.component';
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

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Svart', class: 'bg-black' },
    { name: 'Brun', class: 'bg-brown-500' },
    { name: 'Beige', class: 'bg-[#D2B48C]' },
    { name: 'Grå', class: 'bg-gray-500' },
    { name: 'Hvit', class: 'bg-white border border-gray-300' },
    { name: 'Blå', class: 'bg-blue-500' }
  ];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  return (
    <Layout title="Produkter">
      <Head>
        <title>Produkter | WooCommerce Next.js</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-8">
                <h3 className="font-semibold mb-4">PRODUKT TYPE</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2">T-Shirts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2">Gensere</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2">Singlet</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2">Skjorter</span>
                  </label>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4">PRIS</h3>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span>kr {priceRange[0]}</span>
                  <span>kr {priceRange[1]}</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4">STØRRELSE</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 border rounded ${
                        selectedSizes.includes(size)
                          ? 'bg-gray-900 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">FARGE</h3>
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`w-8 h-8 rounded-full ${color.class} ${
                        selectedColors.includes(color.name)
                          ? 'ring-2 ring-offset-2 ring-gray-900'
                          : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

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
