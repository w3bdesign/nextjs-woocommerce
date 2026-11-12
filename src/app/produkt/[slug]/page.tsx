import { cache } from 'react';
import { ApolloError } from '@apollo/client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import SingleProduct from '@/components/Product/SingleProduct.component';
import Layout from '@/components/Layout/Layout.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { GET_SINGLE_PRODUCT } from '@/utils/gql/GQL_QUERIES';

import type { ISingleProduct } from '@/types/product';

// Rendered on first visit, then cached and refreshed at most every 10 minutes.
export const revalidate = 600;

/** No products are prebuilt at build time; each is rendered on first visit. */
export function generateStaticParams() {
  return [];
}

interface IProductPageProps {
  params: Promise<{ slug: string }>;
}

interface IProductData {
  product: ISingleProduct | null;
}

/** WPGraphQL reports an unknown slug as a GraphQL error on the `product` field. */
const isProductNotFoundError = (error: unknown) =>
  error instanceof ApolloError &&
  error.graphQLErrors.some(
    ({ message, path }) =>
      path?.[0] === 'product' && /no product id was found/i.test(message),
  );

/**
 * Shared by generateMetadata and the page so the product is fetched once.
 * Returns `null` when the product does not exist. Other errors are rethrown so
 * a failed refresh keeps serving the last cached page instead of caching an error.
 */
const getProduct = cache(async (slug: string) => {
  try {
    const { data } = await serverQuery<IProductData>(GET_SINGLE_PRODUCT, {
      slug,
    });
    return data?.product ?? null;
  } catch (error) {
    if (isProductNotFoundError(error)) return null;
    throw error;
  }
});

export async function generateMetadata({
  params,
}: Readonly<IProductPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? '' };
}

/**
 * Display a single product with dynamic pretty urls.
 * Legacy `?id=` URLs are redirected with 301 in `src/proxy.ts`.
 */
export default async function ProductPage({
  params,
}: Readonly<IProductPageProps>) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <Layout title={product.name}>
      <SingleProduct product={product} />
    </Layout>
  );
}
