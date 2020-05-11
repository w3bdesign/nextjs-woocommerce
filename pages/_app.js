import '../styles/index.css'

// Will be called once for every metric that has to be reported.
export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  // console.log(metric);
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
