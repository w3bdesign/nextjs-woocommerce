import { useState, useEffect } from 'react';

import { AppProvider } from 'utils/context/AppContext';

import Header from '../components/Header/Header.component';
import Footer from '../components/Footer/Footer.component';

import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.component';

import '../styles/index.css';
import '../styles/algolia.min.css';

const MyApp = ({ Component, pageProps }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {/*Show LoadingSpinner and hide content to prevent FOUC (Flash of unstyled content)*/}
      {loading && <LoadingSpinner />}
      {!loading && (
        <AppProvider>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </AppProvider>
      )}
    </>
  );
};

export default MyApp;
