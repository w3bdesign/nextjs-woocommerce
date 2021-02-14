import Head from 'next/head';

import Navbar from './Navbar.component';

/**
 * Header for the application.
 * Adds title and some meta properties
 */
const Header = ({title}) => {
  return (
    <>
      <Head>
        <title>Nextjs Ecommerce with WooCommerce {title}</title>
        <meta name="description" content="WooCommerce webshop" />
        <meta name="keywords" content="Ecommerce, WooCommerce" />
        <meta
          property="og:title"
          content="Nextjs Ecommerce with Woocommerce"
          key="pagetitle"
        />
      </Head>
      <Navbar />
    </>
  );
};

export default Header;
