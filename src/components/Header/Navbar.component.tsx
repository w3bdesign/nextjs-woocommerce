import Link from 'next/link';
import { useEffect, useState } from 'react';
import { hasCredentials } from '../../utils/auth';
import Cart from './Cart.component';
import AlgoliaSearchBox from '../AlgoliaSearch/AlgoliaSearchBox.component';
import MobileSearch from '../AlgoliaSearch/MobileSearch.component';

/**
 * Navigation for the application.
 * Includes mobile menu.
 */
const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(hasCredentials());
  }, []);

  return (
    <header className="border-b border-gray-200">
      <nav id="header" className="top-0 z-50 w-full bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col space-y-4 md:hidden">
            <div className="text-center">
              <Link href="/">
                <span className="text-lg font-bold tracking-widest text-gray-900">
                  WEBSHOP
                </span>
              </Link>
            </div>
            <div className="w-full">
              <MobileSearch />
            </div>
          </div>
                    <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/products">
                <span className="text-base uppercase tracking-wider group relative">
                  <span className="relative inline-block">
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 group-hover:w-full transition-all duration-500"></span>
                    Products
                  </span>
                </span>
              </Link>
              <Link href="/categories">
                <span className="text-base uppercase tracking-wider group relative">
                  <span className="relative inline-block">
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 group-hover:w-full transition-all duration-500"></span>
                    Categories
                  </span>
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
              {loggedIn ? (
                <Link href="/my-account">
                  <span className="text-base uppercase tracking-wider group relative">
                    <span className="relative inline-block">
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 group-hover:w-full transition-all duration-500"></span>
                      My Account
                    </span>
                  </span>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <span className="text-base uppercase tracking-wider group relative">
                      <span className="relative inline-block">
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 group-hover:w-full transition-all duration-500"></span>
                        Login
                      </span>
                    </span>
                  </Link>
                  <Link href="/register">
                    <span className="text-base uppercase tracking-wider group relative">
                      <span className="relative inline-block">
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 group-hover:w-full transition-all duration-500"></span>
                        Register
                      </span>
                    </span>
                  </Link>
                </>
              )}
              <Cart />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
