// Imports
import { Lato } from "@next/font/google";

// Types
import type { AppProps } from "next/app";

// Styles
import "@/styles/globals.css";

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"]
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={lato.className}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
