import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import Layout from '@/components/Layout/Layout.component';
import DisplayProducts from '@/components/Product/DisplayProducts.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { GET_PRODUCTS_FROM_CATEGORY } from '@/utils/gql/GQL_QUERIES';

import type { IDisplayProduct } from '@/types/product';

// SSR on every request: same as the previous getServerSideProps.
export const dynamic = 'force-dynamic';

interface ICategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string | string[] }>;
}

interface ICategoryData {
  productCategory: {
    name: string;
    products: { nodes: IDisplayProduct[] };
  } | null;
}

/** Deduplicated per request so generateMetadata and the page share one fetch. */
const getCategory = cache(async (id: string) => {
  const { data } = await serverQuery<ICategoryData>(GET_PRODUCTS_FROM_CATEGORY, {
    id,
  });
  return data?.productCategory ?? null;
});

/** The category is looked up by the `?id=` query parameter (as before). */
const getCategoryId = async (searchParams: ICategoryPageProps['searchParams']) => {
  const { id } = await searchParams;
  return Array.isArray(id) ? id[0] : id;
};

export async function generateMetadata({
  searchParams,
}: ICategoryPageProps): Promise<Metadata> {
  const id = await getCategoryId(searchParams);
  if (!id) return {};
  const category = await getCategory(id);
  return { title: category?.name ?? '' };
}

/**
 * Display all products in a category
 */
export default async function CategoryPage({ searchParams }: ICategoryPageProps) {
  const id = await getCategoryId(searchParams);
  if (!id) notFound();

  const category = await getCategory(id);
  if (!category) notFound();

  const products = category.products?.nodes;

  return (
    <Layout title={category.name}>
      {products ? (
        <DisplayProducts products={products} />
      ) : (
        <div className="mt-8 text-2xl text-center">Laster produkt ...</div>
      )}
    </Layout>
  );
}
