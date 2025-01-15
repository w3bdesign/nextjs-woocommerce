import Head from 'next/head';

import Navbar from './Navbar.component';

interface IHeaderProps {
  title: string;
}

/**
 * Renders header for each page.
 * @function Header
 * @param {string} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */

const Header = ({ title }: IHeaderProps) => (
  <>
    <Head>
      <title>Next.js webshop with WooCommerce {title}</title>
      <meta name="description" content="WooCommerce webshop" />
      <meta name="keywords" content="Ecommerce, WooCommerce" />
      <meta
        property="og:title"
        content="Nextjs Ecommerce with Woocommerce"
        key="pagetitle"
      />
    </Head>
    <div className="container mx-auto px-6">
      <Navbar />
    </div>
  </>
);

export default Header;
