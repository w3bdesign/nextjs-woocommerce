import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';

import Layout from '@/components/Layout/Layout.component';
import SingleProduct from '@/components/Product/SingleProduct.component';

import { serverQuery } from '@/utils/apollo/serverQuery';
import { GET_SINGLE_PRODUCT } from '@/utils/gql/GQL_QUERIES';

import type { ISingleProduct } from '@/types/product';

interface ProductPageProps {
  product: ISingleProduct;
}

/**
 * Displays a single product with pretty URLs (/produkt/[slug]).
 */
const Produkt: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ product }) => (
  <Layout title={product.name}>
    <SingleProduct product={product} />
  </Layout>
);

export default Produkt;

export const getServerSideProps: GetServerSideProps<
  ProductPageProps,
  { slug: string }
> = async ({ params, query, res }) => {
  const slug = params?.slug;

  if (!slug) return { notFound: true };

  // Legacy URLs had an ?id= parameter – permanently redirect to the clean URL
  if (query.id) {
    return {
      redirect: {
        destination: `/produkt/${encodeURIComponent(slug)}`,
        permanent: true,
      },
    };
  }

  const data = await serverQuery<{ product: ISingleProduct | null }>(
    GET_SINGLE_PRODUCT,
    { slug },
  );

  if (!data?.product) return { notFound: true };

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300',
  );

  return { props: { product: data.product } };
};
