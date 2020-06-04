import { request } from 'graphql-request';
import useSWR from 'swr';
import { withRouter } from 'next/router';

import SingleProduct from 'components/Product/SingleProduct.component';

import { WOO_CONFIG } from 'utils/config/nextConfig';

// TODO Read https://github.com/vercel/next.js/discussions/13310
// TODO and https://nextjs.org/blog/next-9-4 and Incremental Static Regeneration and see if it is possible to implement

/**
 * Display a single product with dynamic pretty urls
 */
const Produkt = (props) => {
  // Destructure query string from navigation. Eg { id: "46", slug: "test-produkt-4" }

  const { slug } = props.router.query;

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
            regularPrice
            salePrice
          }
          ... on VariableProduct {
           price
           regularPrice
           salePrice
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
};

export default withRouter(Produkt);
