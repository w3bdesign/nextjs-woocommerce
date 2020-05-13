import { useState } from 'react';

import Link from 'next/link';

function Hamburger() {
  const [isExpanded, setisExpanded] = useState(false);
  return (
    <>
      <label
        htmlFor="menu-toggle"
        aria-label="Meny"
        className="block cursor-pointer md:hidden"
      >
        <svg
          onClick={() => {
            setisExpanded(!isExpanded);
          }}
          className="text-gray-900 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </label>

      {isExpanded && (
        <div
          id="mobile-menu"
          className="absolute right-0 z-50 w-full mt-32 text-center text-black bg-white w-60 h-60"
        >
          <ul>
            <li className="w-full p-4 border border-gray-400 border-solid rounded">
              <Link href="/">
                <a
                  className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                  href="#"
                >
                  Hjem
                </a>
              </Link>
            </li>
            <li className="w-full p-4 border border-gray-400 border-solid rounded">
              <Link href="/produkter">
                <a
                  className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                  href="#"
                >
                  Produkter
                </a>
              </Link>
            </li>
            <li className="w-full p-4 border border-gray-400 border-solid rounded">
              <Link href="/kategorier">
                <a
                  className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                  href="#"
                >
                  Kategorier
                </a>
              </Link>
            </li>
            {
              // Mobilsøk her
            }
          </ul>
        </div>
      )}
    </>
  );
}

export default Hamburger;
