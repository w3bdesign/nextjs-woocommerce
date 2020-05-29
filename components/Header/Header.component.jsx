import Head from 'next/head';

import Navbar from './Navbar.component';

/**
 * Header for the application. 
 * Adds title and some meta properties
 */
const Header = () => {
  return (
    <>
      <Head>
        <title>Nextjs Ecommerce with Woocommerce</title>
        <meta
          property="og:title"
          content="Nextjs ecommerce with Woocommerce"
          key="pagetitle"
        />
      </Head>
      <Navbar />
    </>
  );
};

export default Header;
