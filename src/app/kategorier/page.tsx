import type { Metadata } from 'next';

import Categories from '@/components/Category/Categories.component';
import Layout from '@/components/Layout/Layout.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { FETCH_ALL_CATEGORIES_QUERY } from '@/utils/gql/GQL_QUERIES';

// Cached and refreshed at most every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Kategorier',
};

interface ICategoriesData {
  productCategories: { nodes: { id: string; name: string; slug: string }[] };
}

/**
 * Category page displays all of the categories
 */
export default async function KategorierPage() {
  const { data } = await serverQuery<ICategoriesData>(FETCH_ALL_CATEGORIES_QUERY);
  const categories = data?.productCategories?.nodes;

  return (
    <Layout title="Kategorier">
      {categories && <Categories categories={categories} />}
    </Layout>
  );
}
