import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';

import Layout from '@/components/Layout/Layout.component';
import DisplayProducts from '@/components/Product/DisplayProducts.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { GET_PRODUCTS_FROM_CATEGORY } from '@/utils/gql/GQL_QUERIES';

import type { IDisplayProduct } from '@/types/product';

interface CategoryPageProps {
  categoryName: string;
  products: IDisplayProduct[];
}

interface CategoryQueryResult {
  productCategory: {
    name: string;
    products: { nodes: IDisplayProduct[] };
  } | null;
}

/**
 * Displays all products in a category (/kategori/[slug]).
 * Supports the legacy `?id=` global ID and falls back to looking up by slug.
 */
const Kategori: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ categoryName, products }) => (
  <Layout title={categoryName}>
    {products.length > 0 ? (
      <DisplayProducts products={products} />
    ) : (
      <p className="mt-8 text-2xl text-center">
        Ingen produkter i denne kategorien
      </p>
    )}
  </Layout>
);

export default Kategori;

export const getServerSideProps: GetServerSideProps<
  CategoryPageProps,
  { slug: string }
> = async ({ params, query, res }) => {
  const slug = params?.slug;
  if (!slug) return { notFound: true };

  const id = typeof query.id === 'string' ? query.id : undefined;

  const data = await serverQuery<CategoryQueryResult>(
    GET_PRODUCTS_FROM_CATEGORY,
    id ? { id, idType: 'ID' } : { id: slug, idType: 'SLUG' },
  );

  const category = data?.productCategory;
  if (!category) return { notFound: true };

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300',
  );

  return {
    props: {
      categoryName: category.name,
      products: category.products.nodes,
    },
  };
};
