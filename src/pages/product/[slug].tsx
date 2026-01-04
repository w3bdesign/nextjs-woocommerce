// Imports
import dynamic from 'next/dynamic';
import { withRouter } from 'next/router';

// Components
import BreadcrumbNav from '@/components/Layout/BreadcrumbNav.component';
import Layout from '@/components/Layout/Layout.component';
import SingleProduct from '@/components/Product/SingleProduct.component';
import { Skeleton } from '@/components/ui/skeleton';

const ProductReviews = dynamic(
  () =>
    import('@/components/Product/ProductReviews.component').then((mod) => ({
      default: mod.ProductReviews,
    })),
  {
    ssr: true,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

// Utilities
import client from '@/utils/apollo/ApolloClient';
import { getAuthTokenFromRequest } from '@/utils/auth';

// Types
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';

// GraphQL
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';

/**
 * Display a single product with dynamic pretty urls
 * @function Product
 * @param {InferGetServerSidePropsType<typeof getServerSideProps>} products
 * @returns {JSX.Element} - Rendered component
 */
const Product: NextPage = ({
  product,
  networkStatus,
  isAuthenticated,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const hasError = networkStatus === '8';
  return (
    <Layout title={`${product.name ? product.name : ''}`}>
      {product && (
        <BreadcrumbNav
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.name },
          ]}
        />
      )}
      {product ? (
        <>
          <SingleProduct product={product} />
          <ProductReviews product={product} isAuthenticated={isAuthenticated} />
        </>
      ) : (
        <div className="mt-8 text-2xl text-center">Loading product...</div>
      )}
      {hasError && (
        <div className="mt-8 text-2xl text-center">
          Error loading product...
        </div>
      )}
    </Layout>
  );
};

export default withRouter(Product);

export const getServerSideProps: GetServerSideProps = async ({
  params,
  query,
  res,
  req,
}) => {
  // Handle legacy URLs with ID parameter by removing it
  if (query.id) {
    res.setHeader('Location', `/product/${params?.slug}`);
    res.statusCode = 301;
    res.end();
    return { props: {} };
  }

  // Check authentication status
  const authToken = getAuthTokenFromRequest(req);
  const isAuthenticated = !!authToken;

  // Fetch product with reviews (single query for SSR optimization)
  const { data, loading, networkStatus } = await client.query({
    query: GET_PRODUCT_REVIEWS,
    variables: {
      slug: params?.slug,
      first: 10,
    },
  });

  // Debug logging: Log reviews data with rating field
  if (data?.product?.reviews) {
    console.log('[REVIEWS] Reviews data for product:', params?.slug);
    console.log(
      '[REVIEWS] Reviews edges:',
      JSON.stringify(data.product.reviews.edges, null, 2),
    );
    console.log(
      '[REVIEWS] First review rating:',
      data.product.reviews.edges?.[0]?.node?.rating,
    );
  }

  return {
    props: {
      product: data.product,
      loading,
      networkStatus,
      isAuthenticated,
      initialApolloState: client.cache.extract(),
    },
  };
};
