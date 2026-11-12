import type { Metadata } from 'next';

import Hero from '@/components/Index/Hero.component';
import DisplayProducts from '@/components/Product/DisplayProducts.component';
import Layout from '@/components/Layout/Layout.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';

import type { IDisplayProduct } from '@/types/product';

// ISR: same as the previous getStaticProps `revalidate: 60`.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Hjem',
};

interface IProductsData {
  products: { nodes: IDisplayProduct[] };
}

/**
 * Main index page
 */
export default async function IndexPage() {
  const { data } = await serverQuery<IProductsData>(FETCH_ALL_PRODUCTS_QUERY);
  const products = data?.products?.nodes;

  return (
    <Layout title="Hjem">
      <Hero />
      {products && <DisplayProducts products={products} />}
    </Layout>
  );
}
