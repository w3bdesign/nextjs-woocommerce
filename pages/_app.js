import '../styles/index.css';

// Setup localStorage here
const CartContext = React.createContext();

// Will be called once for every metric that has to be reported.
export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  // console.log(metric);
}

function MyApp({ Component, pageProps }) {
  return (
    <CartContext.Provider value="">
      <Component {...pageProps} />;
    </CartContext.Provider>
  );
}

export default MyApp;
