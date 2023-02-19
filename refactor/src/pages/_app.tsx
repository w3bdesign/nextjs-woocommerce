// Types
import type { AppProps } from 'next/app';

// Styles
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
