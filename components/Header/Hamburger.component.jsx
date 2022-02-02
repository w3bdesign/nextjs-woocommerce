import { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import Link from 'next/link';

import LINKS from '../../utils/constants/LINKS';

/**
 * Shows the mobile menu.
 */
const Hamburger = () => {
  const [isExpanded, setisExpanded] = useState(false);
  const hamburgerSlideDownAnimation = useSpring({
    to: [
      {
        opacity: isExpanded ? 1 : 0,
        marginTop: isExpanded ? '170px' : '-180px',
      },
    ],
    from: {
      opacity: isExpanded ? 1 : 0,
      marginTop: isExpanded ? '170px' : '-180px',
    },
  });
  const showHamburgerHideXAnimation = useSpring({
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
  const showXHideHamburgerAnimation = useSpring({
    to: [
      {
        opacity: isExpanded ? 1 : 0,
        display: isExpanded ? 'inline' : 'none',
      },
    ],
    from: {
      opacity: isExpanded ? 0 : 1,
      display: isExpanded ? 'none' : 'inline',
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
          id="hamburgersvg"
          style={showHamburgerHideXAnimation}
          onClick={() => {
            setisExpanded((prevExpanded) => !prevExpanded);
          }}
          className="text-gray-900 fill-current"
          xmlns="https://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 25 25"
        >
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </animated.svg>
        <animated.svg
          id="xsvg"
          onClick={() => {
            setisExpanded((prevExpanded) => !prevExpanded);
          }}
          style={showXHideHamburgerAnimation}
          xmlns="https://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 25 25"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </animated.svg>
      </label>
      {isExpanded && (
        <animated.div
          style={hamburgerSlideDownAnimation}
          id="mobile-menu"
          className="absolute right-0 z-10 w-full text-center text-black bg-white "
        >
          <ul>
            {LINKS.map(({ id, title, href }) => (
              <li
                key={id}
                id="mobile-li"
                className="w-full p-4 border-t border-gray-400 border-solid rounded"
              >
                <Link href={href}>
                  <a className="inline-block px-4 py-2 no-underline hover:text-black hover:underline">
                    {title}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </animated.div>
      )}
    </>
  );
};

export default Hamburger;
