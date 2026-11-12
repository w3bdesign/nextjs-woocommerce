import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import SingleProduct from '@/components/Product/SingleProduct.component';
import Layout from '@/components/Layout/Layout.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { GET_SINGLE_PRODUCT } from '@/utils/gql/GQL_QUERIES';

import type { ISingleProduct } from '@/types/product';

// SSR on every request: same as the previous getServerSideProps.
export const dynamic = 'force-dynamic';

interface IProductPageProps {
  params: Promise<{ slug: string }>;
}

interface IProductData {
  product: ISingleProduct | null;
}

/**
 * Deduplicated per request so generateMetadata and the page share one fetch.
 * Returns `undefined` when the backend request fails.
 */
const getProduct = cache(async (slug: string) => {
  try {
    const { data } = await serverQuery<IProductData>(GET_SINGLE_PRODUCT, {
      slug,
    });
    return data?.product ?? null;
  } catch (error) {
    console.error('Failed to load product', slug, error);
    return undefined;
  }
});

export async function generateMetadata({
  params,
}: IProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? '' };
}

/**
 * Display a single product with dynamic pretty urls.
 * Legacy `?id=` URLs are redirected with 301 in `src/proxy.ts`.
 */
export default async function ProductPage({ params }: IProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (product === null) {
    notFound();
  }

  return (
    <Layout title={product?.name ?? ''}>
      {product ? (
        <SingleProduct product={product} />
      ) : (
        <div className="mt-8 text-2xl text-center">
          Feil under lasting av produkt ...
        </div>
      )}
    </Layout>
  );
}
