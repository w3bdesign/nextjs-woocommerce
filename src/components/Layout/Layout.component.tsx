// Imports
import { ReactNode, useContext, useEffect } from 'react';
import { useQuery } from '@apollo/client';

// Components
import Header from '@/components/Header/Header.component';
import PageTitle from './PageTitle.component';
import Footer from '@/components/Footer/Footer.component';
import Stickynav from '@/components/Footer/Stickynav.component';

// State
import { CartContext } from '@/stores/CartProvider';

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
  const { setCart } = useContext(CartContext);

  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);

      if (!updatedCart && !data?.cart?.contents?.nodes.length) {
        // Should we clear the localStorage if we have no remote cart?
        return;
      }

      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));

      // Update cart data in React Context.
      setCart(updatedCart);
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="flex flex-col min-h-screen w-full mx-auto">
      <div className="container min-w-[140vw] sm:min-w-[95vw] md:px-4 lg:px-6 py-2 lg:max-w-[1600px] mx-auto">
        <Header title={title} />
        <PageTitle title={title} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Stickynav />
      </div>
    </div>
  );
};

export default Layout;
