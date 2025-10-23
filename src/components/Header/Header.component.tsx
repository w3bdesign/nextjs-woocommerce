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
      <title>{`MEBL Furniture Store ${title ? '- ' + title : ''}`}</title>
      <meta
        name="description"
        content="Premium furniture store with customizable 3D configurator"
      />
      <meta
        name="keywords"
        content="Furniture, Ecommerce, 3D Configurator, WooCommerce"
      />
      <meta
        property="og:title"
        content="MEBL Furniture Store - Premium Furniture with 3D Customization"
        key="pagetitle"
      />
    </Head>
    <div className="container mx-auto px-6">
      <Navbar />
    </div>
  </>
);

export default Header;
