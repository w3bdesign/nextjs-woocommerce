import Head from 'next/head';

import Navbar from './Navbar.component';

function Header() {
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
}

export default Header;
