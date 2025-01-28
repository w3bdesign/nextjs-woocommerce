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

interface ProductCategory {
  name: string;
  slug: string;
}

interface ColorNode {
  name: string;
}

interface SizeNode {
  name: string;
}

interface AttributeNode {
  name: string;
  value: string;
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
  productCategories?: {
    nodes: ProductCategory[];
  };
  allPaColors?: {
    nodes: ColorNode[];
  };
  allPaSizes?: {
    nodes: SizeNode[];
  };
  variations: {
    nodes: Array<{
      price: string;
      regularPrice: string;
      salePrice?: string;
      attributes?: {
        nodes: AttributeNode[];
      };
    }>;
  };
}

interface ProductType {
  id: string;
  name: string;
  checked: boolean;
}

const Products2: NextPage = ({
  products,
  loading,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([
    { id: 't-shirts', name: 'T-Shirts', checked: false },
    { id: 'gensere', name: 'Gensere', checked: false },
    { id: 'singlet', name: 'Singlet', checked: false },
    { id: 'skjorter', name: 'Skjorter', checked: false }
  ]);

  const toggleProductType = (id: string) => {
    setProductTypes(prev => prev.map(type => 
      type.id === id ? { ...type, checked: !type.checked } : type
    ));
  };

  // Filter products based on selected filters
  const filteredProducts = products?.filter((product: Product) => {
    // Filter by price
    const productPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    const withinPriceRange = productPrice >= priceRange[0] && productPrice <= priceRange[1];
    if (!withinPriceRange) return false;

    // Filter by product type
    const selectedTypes = productTypes.filter(t => t.checked).map(t => t.name.toLowerCase());
    if (selectedTypes.length > 0) {
      const productCategories = product.productCategories?.nodes.map((cat: ProductCategory) => cat.name.toLowerCase()) || [];
      if (!selectedTypes.some(type => productCategories.includes(type))) return false;
    }

    // Filter by size
    if (selectedSizes.length > 0) {
      const productSizes = product.allPaSizes?.nodes.map((node: SizeNode) => node.name) || [];
      if (!selectedSizes.some(size => productSizes.includes(size))) return false;
    }

    // Filter by color
    if (selectedColors.length > 0) {
      const productColors = product.allPaColors?.nodes.map((node: ColorNode) => node.name) || [];
      if (!selectedColors.some(color => productColors.includes(color))) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));

    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'newest':
        return b.databaseId - a.databaseId;
      default: // 'popular'
        return 0;
    }
  });

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
            productTypes={productTypes}
            toggleProductType={toggleProductType}
            products={products}
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
              {sortedProducts.map((product: Product) => (
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
