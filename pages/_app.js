import { ApolloProvider } from '@apollo/client';

import { AppProvider } from 'utils/context/AppContext';

import Header from '../components/Header/Header.component';
import Footer from '../components/Footer/Footer.component';

import '../styles/index.css';
import '../styles/algolia.min.css';

import client from '../utils/apollo/ApolloClient';

const App = ({ Component, pageProps }) => {
  return (
    <>
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

export default App;
