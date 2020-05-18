import { request } from 'graphql-request';
import useSWR from 'swr';
import { withRouter, useRouter } from 'next/router';

import Header from 'components/Header/Header.component';
import SingleProduct from 'components/Main/SingleProduct.component';

import { WOO_CONFIG } from 'config/nextConfig';

// Display a single product with dynamic pretty urls
function Produkt(props) {
  // Destructure query string from navigation. Eg { id: "46", slug: "test-produkt-4" }
  const router = useRouter();
  const { slug } = router.query;

  const FETCH_SINGLE_PRODUCT_QUERY = `
  query MyQuery {
    products(where: {slug: "${slug}"}) {
      edges {
        node {
          name
          productId
          image {
            sourceUrl
          }
          onSale
          description
          ... on SimpleProduct {
          
            price
          }
          ... on VariableProduct {
           price
          }
        }
      }
    }
  }
  `;

  const { data, error } = useSWR(FETCH_SINGLE_PRODUCT_QUERY, (query) =>
    request(WOO_CONFIG.GRAPHQL_URL, query)
  );

  return (
    <>
      <Header />
      {data ? (
        <SingleProduct product={data} />
      ) : (
        <div className="mt-8 text-2xl text-center">Laster produkt ...</div>
      )}
      {/* Display error message if error occured */}
      {error && (
        <div className="mt-8 text-2xl text-center">
          Feil under lasting av produkt ...
        </div>
      )}
    </>
  );
}

// Send the page query parameters to the useRouter (eg slug: "test-produkt-4")
export async function getStaticProps(context) {
  return {
    props: { query: context },
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: '1' } }],
    fallback: true, // See the "fallback" section below
  };
}

export default withRouter(Produkt);
