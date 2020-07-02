import { ApolloProvider } from '@apollo/react-hooks';
import { AppProvider } from 'utils/context/AppContext';

import Router from 'next/router';
import NProgress from 'nprogress';

import Header from '../components/Header/Header.component';
import Footer from '../components/Footer/Footer.component';

import '../styles/index.css';
import '../styles/algolia.min.css';
import '../styles/animate.min.css';
import 'nprogress/nprogress.css';

import client from '../utils/apollo/ApolloClient';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

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
