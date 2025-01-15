// Imports
import Link from 'next/link';

// Components
import Cart from './Cart.component';
import AlgoliaSearchBox from '../AlgoliaSearch/AlgoliaSearchBox.component';
import MobileSearch from '../AlgoliaSearch/MobileSearch.component';

// Utils
import useIsMobile from '@/utils/hooks/useIsMobile';

/**
 * Navigation for the application.
 * Includes mobile menu.
 */
const Navbar = () => {
  const isMobile = useIsMobile();
  return (
    <header className="border-b border-gray-200">
      <nav id="header" className="top-0 z-50 w-full bg-white">
        <div className="container flex flex-col md:flex-row items-center justify-between px-6 py-4 mx-auto mt-0">
          <div className="order-3 hidden w-full md:flex md:items-center md:w-auto md:order-1" id="menu">
            <ul className="items-center justify-between pt-4 text-base text-gray-700 md:flex md:pt-0 space-x-8">
              <li>
                <Link href="/produkter">
                  <span className="inline-block py-2 text-sm uppercase tracking-wider hover:text-gray-500 transition-colors">
                    Produkter
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/kategorier">
                  <span className="inline-block py-2 text-sm uppercase tracking-wider hover:text-gray-500 transition-colors">
                    Kategorier
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <Link href="/">
              <span className="flex items-center text-xl font-bold tracking-widest text-gray-900 no-underline hover:text-gray-700 transition-colors">
                NETTBUTIKK
              </span>
            </Link>
          </div>
          <div
            className="flex items-center order-2 md:order-3"
            id="nav-content"
          >
            <AlgoliaSearchBox />
            <MobileSearch />
            {!isMobile && <Cart />}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
