// Imports
import { ReactNode } from 'react';

// Components
import Header from '@/components/Header/Header.component';
import PageTitle from '@/components/Layout/PageTitle.component';
import Footer from '@/components/Footer/Footer.component';
import Stickynav from '@/components/Footer/Stickynav.component';

interface ILayoutProps {
  children?: ReactNode;
  title: string;
}

/**
 * Renders layout for each page.
 * The document <title> is set by the route's `metadata` / `generateMetadata`.
 * @function Layout
 * @param {ReactNode} children - Children to be rendered by Layout component
 * @param {string} title - Visible page heading (rendered by PageTitle, except on "Hjem")
 * @returns {JSX.Element} - Rendered component
 */

const Layout = ({ children, title }: Readonly<ILayoutProps>) => {
  return (
    <div className="flex flex-col min-h-screen w-full mx-auto bg-surface">
      <Header />
      {title === 'Hjem' ? (
        <main className="flex-1">{children}</main>
      ) : (
        <div className="container mx-auto px-6 flex-1">
          <PageTitle title={title} />
          <main>{children}</main>
        </div>
      )}
      <div className="mt-auto">
        <Footer />
        <Stickynav />
      </div>
    </div>
  );
};

export default Layout;
