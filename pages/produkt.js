import { request } from 'graphql-request';
import useSWR from 'swr';
import { withRouter } from 'next/router';

import Header from 'components/Header/Header.component';
import SingleProduct from 'components/Main/SingleProduct.component';

import { WOO_CONFIG } from 'config/nextConfig';

function Produkt(props) {
  // Destructure query string from navigation. Eg { id: "46", slug: "test-produkt-4" }
  // Returns query
  const {
    router: { query },
  } = props;

  const FETCH_SINGLE_PRODUCT_QUERY = `
  query MyQuery {
    products(where: {slug: "${query.slug}"}) {
      edges {
        node {
          name
          productId
          image {
            sourceUrl
          }
          onSale
          description
        }
      }
    }
  }
  `;

  const { data, error } = useSWR(FETCH_SINGLE_PRODUCT_QUERY, (query) =>
    request(WOO_CONFIG.GRAPHQL_URL, query)
  );
  if (error) {
    console.log(error);
  }

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

export async function getStaticProps(context) {
  console.log(context);
  return {
    props: { query: context }, // will be passed to the page component as props
  };
}

export default withRouter(Produkt);
