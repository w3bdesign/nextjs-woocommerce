import { ReactNode } from 'react';

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

const Layout = ({ children, title }: ILayoutProps): JSX.Element => (
  <>
    <Header title={title} />
    <PageTitle title={title} />
    {children}
  </>
);

export default Layout;
