import type { Metadata } from 'next';

import Layout from '@/components/Layout/Layout.component';
import ProductList from '@/components/Product/ProductList.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';

import type { Product } from '@/types/product';

// ISR: same as the previous getStaticProps `revalidate: 60`.
export const revalidate = 60;

export const metadata: Metadata = {
  // The Pages Router version overrode the shared title template via next/head.
  title: { absolute: 'Produkter | WooCommerce Next.js' },
};

interface IProductsData {
  products: { nodes: Product[] };
}

/**
 * Product listing page with client-side filters
 */
export default async function ProdukterPage() {
  const { data } = await serverQuery<IProductsData>(FETCH_ALL_PRODUCTS_QUERY);
  const products = data?.products?.nodes;

  if (!products) {
    return (
      <Layout title="Produkter">
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-error">Ingen produkter funnet</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Produkter">
      <div className="container mx-auto px-4 py-8">
        <ProductList products={products} title="Herreklær" />
      </div>
    </Layout>
  );
}
