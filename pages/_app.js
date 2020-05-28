import { AppProvider } from 'utils/context/AppContext';

import Header from '../components/Header/Header.component';
import Footer from '../components/Footer/Footer.component';

import '../styles/index.css';
import '../styles/algolia.min.css';


// Will be called once for every metric that has to be reported.
export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  // console.log(metric);
}

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
