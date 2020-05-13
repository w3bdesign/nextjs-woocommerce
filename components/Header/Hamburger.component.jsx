import { useState } from 'react';
import { useSpring, animated } from 'react-spring'
import Link from 'next/link';

import MobileSearch from "./MobileSearch.component"

function Hamburger() {
  const [isExpanded, setisExpanded] = useState(false);
  // TODO Implement more advanced transitions, see https://codesandbox.io/embed/zn2q57vn13
  //const animation = useSpring({ opacity: isExpanded ? 1 : 0 })

  const animation = useSpring({
    to: [{ opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? '180px' : "-180px" }],
    from: { opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? '180px' : "-180px" }
  })

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
        <animated.div style={animation}
          id="mobile-menu"
          className="absolute right-0 z-50 w-full text-center text-black bg-white"
        >
          <ul>
            <li className="w-full p-4 border-t border-b border-gray-400 border-solid rounded">
              <Link href="/">
                <a
                  className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                  href="#"
                >
                  Hjem
                </a>
              </Link>
            </li>
            <li className="w-full p-4 border-b border-gray-400 border-solid rounded">
              <Link href="/produkter">
                <a
                  className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                  href="#"
                >
                  Produkter
                </a>
              </Link>
            </li>
            <li className="w-full p-4 border-b border-gray-400 border-solid rounded">
              <Link href="/kategorier">
                <a
                  className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                  href="#"
                >
                  Kategorier
                </a>
              </Link>
            </li>
            <li className="w-full p-4 border-gray-400 border-solid rounded">

              <MobileSearch />
            </li>
          </ul>
        </animated.div>
      )}
    </>
  );
}

export default Hamburger;
