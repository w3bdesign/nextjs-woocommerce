//import { useState, useEffect } from 'react';


import { ApolloProvider } from '@apollo/client';
import ApolloClient from 'apollo-boost';

import { AppProvider } from 'utils/context/AppContext';
import { WOO_CONFIG } from 'utils/config/nextConfig';

import Header from '../components/Header/Header.component';
import Footer from '../components/Footer/Footer.component';

//import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.component';

import '../styles/index.css';
import '../styles/algolia.min.css';

const client = new ApolloClient({
  uri: WOO_CONFIG.GRAPHQL_URL,
});

const MyApp = ({ Component, pageProps }) => {
  /*
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);
  */

  return (
    <>
      {/*Show LoadingSpinner and hide content to prevent FOUC (Flash of unstyled content) {loading && <LoadingSpinner />}*/}

      <ApolloProvider client={client}>
        <AppProvider>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </AppProvider>
      </ApolloProvider>
    </>
  );
};

export default MyApp;
