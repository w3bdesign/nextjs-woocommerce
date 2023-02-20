// Imports
import Router from 'next/router';
import NProgress from 'nprogress';

// State import
import { CartProvider } from '@/utils/context/CartProvider';

// Types
import type { AppProps } from 'next/app';

// Styles
import '@/styles/globals.css';
import 'nprogress/nprogress.css';

// NProgress
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </>
  );
}

export default MyApp;
