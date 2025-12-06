// Imports
import { withRouter } from 'next/router';

// Components
import BreadcrumbNav from '@/components/Layout/BreadcrumbNav.component';
import Layout from '@/components/Layout/Layout.component';
import SingleProduct from '@/components/Product/SingleProduct.component';

// Utilities
import client from '@/utils/apollo/ApolloClient';

// Types
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';

// GraphQL
import { GET_SINGLE_PRODUCT } from '@/utils/gql/GQL_QUERIES';

/**
 * Display a single product with dynamic pretty urls
 * @function Product
 * @param {InferGetServerSidePropsType<typeof getServerSideProps>} products
 * @returns {JSX.Element} - Rendered component
 */
const Product: NextPage = ({
  product,
  networkStatus,
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
        <SingleProduct product={product} />
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
}) => {
  // Handle legacy URLs with ID parameter by removing it
  if (query.id) {
    res.setHeader('Location', `/product/${params?.slug}`);
    res.statusCode = 301;
    res.end();
    return { props: {} };
  }

  const { data, loading, networkStatus } = await client.query({
    query: GET_SINGLE_PRODUCT,
    variables: { slug: params?.slug },
  });

  // Debug logging: Log raw GraphQL response for configurator data
  if (data?.product?.configurator) {
    console.log('[NETWORK] GraphQL Response for product:', params?.slug);
    console.log(
      '[NETWORK] Configurator data:',
      JSON.stringify(data.product.configurator, null, 2),
    );
    console.log(
      '[NETWORK] Full product data:',
      JSON.stringify(
        {
          databaseId: data.product.databaseId,
          name: data.product.name,
          configurator: data.product.configurator,
        },
        null,
        2,
      ),
    );
  }

  return {
    props: { product: data.product, loading, networkStatus },
  };
};
