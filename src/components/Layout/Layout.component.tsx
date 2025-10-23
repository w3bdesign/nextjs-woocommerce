// Imports
import { ReactNode } from 'react';

// Components
import Footer from '@/components/Footer/Footer.component';
import Header from '@/components/Header/Header.component';
import PageTitle from './PageTitle.component';

interface ILayoutProps {
  children?: ReactNode;
  title: string;
}

/**
 * Renders layout for each page. Also passes along the title to the Header component.
 * @function Layout
 * @param {ReactNode} children - Children to be rendered by Layout component
 * @param {TTitle} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */

const Layout = ({ children, title }: ILayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen w-full mx-auto">
      {/* Skip to main content link for keyboard navigation (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <Header title={title} />
      {title === 'Home' ? (
        <main id="main-content" className="flex-1 px-4 md:px-0">
          {children}
        </main>
      ) : (
        <div className="container mx-auto px-6 flex-1">
          <PageTitle title={title} />
          <main id="main-content">{children}</main>
        </div>
      )}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
