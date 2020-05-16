import { request } from 'graphql-request';
import useSWR from 'swr';

import Header from 'components/Header/Header.component';
import Hero from 'components/Main/Hero.component';
import IndexProducts from 'components/Main/IndexProducts.component';

import WOO_CONFIG from '../nextConfig';
import { FETCH_ALL_PRODUCTS_QUERY } from 'const/GQL_QUERIES';

// https://apppresser.com/woocommerce-rest-api/
// https://dev.to/aryanjnyc/i-migrated-away-from-apollo-client-to-vercel-swr-and-prisma-graphql-request-and-you-can-too-245b
// https://medium.com/better-programming/why-you-should-be-separating-your-server-cache-from-your-ui-state-1585a9ae8336

function HomePage() {
  const { data, error } = useSWR(FETCH_ALL_PRODUCTS_QUERY, (query) =>
    request(WOO_CONFIG.GRAPHQL_URL, query)
  );

  return (
    <>
      <Header />
      <Hero />

      {data ? (
        <IndexProducts products={data} />
      ) : (
        <div className="mt-8 text-2xl text-center">Laster produkter ...</div>
      )}

      {/* Display error message if error occured */}
      {error && (
        <div className="mt-8 text-2xl text-center">
          Feil under lasting av produkter ...
        </div>
      )}
    </>
  );
}

export default HomePage;
