import Link from 'next/link';

import Cart from '../Cart/Cart.component';
import Search from '../AlgoliaSearch/AlgoliaSearchBox.component';
import SVGMobileSearchIcon from '../SVG/SVGMobileSearchIcon.component';

import Hamburger from '../Header/Hamburger.component';

/**
 * Navigation for the application.
 * Includes mobile menu.
 */
const Stickynav = () => (
  <nav
    id="footer"
    className="fixed bottom-0 z-50 w-full py-1 bg-white md:hidden lg:hidden xl:hidden"
  >
    <div className="container flex flex-wrap items-center justify-between px-6 py-3 mx-auto mt-0 md:min-w-96">
      <Hamburger />
      <div
        className="order-3 hidden w-full md:flex md:items-center md:w-auto md:order-1"
        id="menu"
      >
        <ul className="items-center justify-between pt-4 text-base text-gray-700 md:flex md:pt-0">
          <li>
            <Link href="/produkter">
              <a className="inline-block py-2 pr-4 text-xl font-bold no-underline hover:underline">
                Produkter
              </a>
            </Link>
          </li>
          <li>
            <Link href="/kategorier">
              <a className="inline-block py-2 pr-4 text-xl font-bold no-underline hover:underline">
                Kategorier
              </a>
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex items-center order-2 md:order-3" id="nav-content">
        <Search />
        <SVGMobileSearchIcon />
        <Cart />
      </div>
    </div>
  </nav>
);

export default Stickynav;
