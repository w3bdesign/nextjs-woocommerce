// Imports
import { ReactNode } from 'react';
import { useQuery } from '@apollo/client';

// Components
import Header from '@/components/Header/Header.component';
import PageTitle from './PageTitle.component';
import Footer from '@/components/Footer/Footer.component';

// Imports
import { useContext, useEffect } from 'react';

// State
import { CartContext } from '@/utils/context/CartProvider';

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

const Layout = ({ children, title }: ILayoutProps): JSX.Element => {
  const { setCart } = useContext(CartContext);

  useEffect(() => {
    refetch();
  }, []);

  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      refetch();

      // Update cart in the localStorage.
      const updatedCart: any = getFormattedCart(data); // TODO Remove this any later
      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));

      // Update cart data in React Context.
      setCart(updatedCart);
    },
  });

  return (
    <>
      <Header title={title} />
      <PageTitle title={title} />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
