import { AppProvider } from 'utils/context/AppContext';

import Header from '../components/Header/Header.component';
import Footer from '../components/Footer/Footer.component';

import '../styles/index.css';
import '../styles/algolia.min.css';

const MyApp = ({ Component, pageProps }) => {
  return (
    <AppProvider>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </AppProvider>
  );
};

export default MyApp;
