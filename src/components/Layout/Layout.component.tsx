// Imports
import React, { ReactNode, useEffect } from 'react';
import { useQuery } from '@apollo/client';

// Components
import Header from '@/components/Header/Header.component';
import PageTitle from './PageTitle.component';
import Footer from '@/components/Footer/Footer.component';
import Stickynav from '@/components/Footer/Stickynav.component';

// State
import { useCartStore } from '@/stores/cartStore';

// Utils
import { getFormattedCart } from '@/utils/functions/functions';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

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
  const { updateCart } = useCartStore();

  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      const updatedCart = getFormattedCart(data);
      
      if (updatedCart) {
        // Update cart in localStorage and Zustand store
        localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));
        updateCart(updatedCart);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="flex flex-col min-h-screen w-full mx-auto">
      <Header title={title} />
      {title === 'Hjem' ? (
        <main className="flex-1 px-4 md:px-0">{children}</main>
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
