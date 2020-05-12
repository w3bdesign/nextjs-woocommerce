import Head from 'next/head';

import Navbar from './Navbar.component';

function Header() {
  // https://www.netlify.com/blog/2020/05/08/improve-your-seo-and-social-sharing-cards-with-next.js/
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
