import { ApolloProvider } from '@apollo/client';
import { AppProvider } from 'utils/context/AppContext';

import Router from 'next/router';
import NProgress from 'nprogress';

import Footer from 'components/Footer/Footer.component';

import 'styles/index.css';
import 'styles/animate.min.css';
import 'nprogress/nprogress.css';

import client from 'utils/apollo/ApolloClient';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const App = ({ Component, pageProps }) => (
  <ApolloProvider client={client}>
    <AppProvider>
      <Component {...pageProps} />
      <Footer />
    </AppProvider>
  </ApolloProvider>
);

export default App;
