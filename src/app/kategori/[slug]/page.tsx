import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import Layout from '@/components/Layout/Layout.component';
import DisplayProducts from '@/components/Product/DisplayProducts.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { GET_PRODUCTS_FROM_CATEGORY } from '@/utils/gql/GQL_QUERIES';

import type { IDisplayProduct } from '@/types/product';

// Rendered on first visit, then cached and refreshed at most every 10 minutes.
export const revalidate = 600;

/** No categories are prebuilt at build time; each is rendered on first visit. */
export function generateStaticParams() {
  return [];
}

interface ICategoryPageProps {
  params: Promise<{ slug: string }>;
}

interface ICategoryData {
  productCategory: {
    name: string;
    products: { nodes: IDisplayProduct[] };
  } | null;
}

/** Shared by generateMetadata and the page so the category is fetched once. */
const getCategory = cache(async (slug: string) => {
  const { data } = await serverQuery<ICategoryData>(GET_PRODUCTS_FROM_CATEGORY, {
    slug,
  });
  return data?.productCategory ?? null;
});

export async function generateMetadata({
  params,
}: Readonly<ICategoryPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return { title: category?.name ?? '' };
}

/**
 * Display all products in a category.
 * Legacy `?id=` URLs are redirected with 301 in `src/proxy.ts`.
 */
export default async function CategoryPage({
  params,
}: Readonly<ICategoryPageProps>) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <Layout title={category.name}>
      <DisplayProducts products={category.products?.nodes ?? []} />
    </Layout>
  );
}
