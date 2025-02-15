// Imports
import { withRouter } from 'next/router';

// Components
import SingleProduct from '@/components/Product/SingleProduct.component';
import Layout from '@/components/Layout/Layout.component';

// Utilities
import client from '@/utils/apollo/ApolloClient';

// Types
import type { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next';

// GraphQL
import { GET_SINGLE_PRODUCT } from '@/utils/gql/GQL_QUERIES';

/**
 * Display a single product with dynamic pretty URLs.
 * This implementation removes unnecessary query parameters for SEO purposes,
 * and uses the product slug to search for the product. If an "id" is present in the query,
 * it redirects to a URL without the id.
 * @function Produkt
 * @param {InferGetServerSidePropsType<typeof getServerSideProps>} props
 * @returns {JSX.Element} - Rendered component
 */
const Produkt: NextPage = ({
  product,
  networkStatus,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const hasError = networkStatus === '8';
  return (
    <Layout title={product.name || ''}>
      {product ? (
        <SingleProduct product={product} />
      ) : (
        <div className="mt-8 text-2xl text-center">Laster produkt ...</div>
      )}
      {hasError && (
        <div className="mt-8 text-2xl text-center">
          Feil under lasting av produkt ...
        </div>
      )}
    </Layout>
  );
};

export default withRouter(Produkt);

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  // Extract 'slug' and 'id' from the query parameters.
  const { id, slug } = query;

  // For SEO, if an 'id' is provided in the query, redirect to a clean URL using only the slug.
  if (id) {
    return {
      redirect: {
        destination: `/produkt/${slug}`,
        permanent: true,
      },
    };
  }

  // Use the slug to fetch the product via its slug.
  const variables = { id: slug, idType: 'SLUG' };

  const { data, loading, networkStatus } = await client.query({
    query: GET_SINGLE_PRODUCT,
    variables,
  });

  // If the slug in the URL doesn't match the product's actual slug, redirect to the correct URL.
  if (slug && data.product.slug !== slug) {
    return {
      redirect: {
        destination: `/produkt/${data.product.slug}`,
        permanent: true,
      },
    };
  }

  return {
    props: { product: data.product, loading, networkStatus },
  };
};
