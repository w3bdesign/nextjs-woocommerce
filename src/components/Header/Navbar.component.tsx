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
        <div className="container mx-auto px-4 sm:px-6 py-4">
          {isMobile ? (
            // Mobile layout - logo with search below
            <div className="flex flex-col space-y-4">
              <div className="text-center">
                <Link href="/">
                  <span className="text-lg font-bold tracking-widest text-gray-900">
                    NETTBUTIKK
                  </span>
                </Link>
              </div>
              <div className="w-full">
                <MobileSearch />
              </div>
            </div>
          ) : (
            // Desktop layout
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link href="/produkter">
                  <span className="text-sm uppercase tracking-wider hover:text-gray-500 transition-colors">
                    Produkter
                  </span>
                </Link>
                <Link href="/kategorier">
                  <span className="text-sm uppercase tracking-wider hover:text-gray-500 transition-colors">
                    Kategorier
                  </span>
                </Link>
              </div>
              <Link href="/" className="hidden lg:block">
                <span className="text-xl font-bold tracking-widest text-gray-900 hover:text-gray-700 transition-colors">
                  NETTBUTIKK
                </span>
              </Link>
              <div className="flex items-center space-x-3">
                <AlgoliaSearchBox />
                <Cart />
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
