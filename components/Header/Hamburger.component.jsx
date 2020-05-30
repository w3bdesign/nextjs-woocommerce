import { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import Link from 'next/link';

import MobileSearch from '../Search/MobileSearch.component';

/**
 * Shows the mobile menu.
 * Uses React-spring for animations.
 */
const Hamburger = () => {
  const [isExpanded, setisExpanded] = useState(false);
  const [isTest, setisTest] = useState(false);

  const hamburgerSlideAnimation = useSpring({
    to: [
      {
        opacity: isExpanded ? 1 : 0,
        marginTop: isExpanded ? '180px' : '-180px',
      },
    ],
    from: {
      opacity: isExpanded ? 1 : 0,
      marginTop: isExpanded ? '180px' : '-180px',
    },
  });

  const hamburgerToXAnimation = useSpring({
    to: [
      {
        opacity: isExpanded ? 0 : 1,
        display: isExpanded ? 'none' : 'inline',
      },
    ],
    from: {
      opacity: isExpanded ? 0 : 1,
    },
  });

  const showXAnimation = useSpring({
    to: [
      {
        opacity: isExpanded ? 1 : 0,
        display: isExpanded ? 'inline' : 'none',
      },
    ],
    from: {
      opacity: isTest ? 0 : 1,
      display: isTest ? 'none' : 'inline',
    },
  });

  return (
    <>
      <label
        htmlFor="menu-toggle"
        aria-label="Meny"
        className="block cursor-pointer md:hidden"
      >
        <animated.svg
          style={hamburgerToXAnimation}
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
        </animated.svg>

        <animated.svg
          onClick={() => {
            setisExpanded(!isExpanded);
          }}
          style={showXAnimation}
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-x"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </animated.svg>
      </label>

      {isExpanded && (
        <animated.div
          style={hamburgerSlideAnimation}
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
};

export default Hamburger;
