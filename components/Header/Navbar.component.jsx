import Link from 'next/link';

import Cart from '../Cart/Cart.component';
import Search from '../AlgoliaSearch/AlgoliaSearchBox.component';
import SVGMobileSearchIcon from '../SVG/SVGMobileSearchIcon.component';
import Hamburger from './Hamburger.component';

/**
 * Navigation for the application.
 * Includes mobile menu.
 */
const Navbar = () => (
  <header>
    <nav id="header" className="fixed top-0 z-50 w-full py-1 bg-white ">
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
        <div className="order-1 md:order-2">
          <Link href="/">
            <a className="flex items-center text-xl font-bold tracking-wide text-gray-800 no-underline hover:no-underline ">
              <svg
                className="mr-2 text-gray-800 fill-current"
                xmlns="https://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                aria-label="Nettbutikk logo"
              >
                <path
                  d="M5,22h14c1.103,0,2-0.897,2-2V9c0-0.553-0.447-1-1-1h-3V7c0-2.757-2.243-5-5-5S7,4.243,7,7v1H4C3.447,8,3,8.447,3,9v11 C3,21.103,3.897,22,5,22z M9,7c0-1.654,1.346-3,3-3s3,1.346,3,3v1H9V7z M5,10h2v2h2v-2h6v2h2v-2h2l0.002,10H5V10z"
                  aria-label="Nettbutikk logo"
                />
              </svg>
              NETTBUTIKK
            </a>
          </Link>
        </div>
        <div
          className="flex items-center order-2 md:order-3"
          id="nav-content"
        >
          <Search />
          <SVGMobileSearchIcon />
          <Cart />
        </div>
      </div>
    </nav>
  </header>
);

export default Navbar;
