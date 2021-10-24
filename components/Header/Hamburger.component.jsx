import { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import Menu from './Menu.component';
/**
 * Shows the mobile menu.
 * Shows a X when mobile menu is expanded.
 * Uses React-spring for animations.
 */
const Hamburger = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const slideDownAnimationOptions =  {
    opacity: isExpanded ? 1 : 0,
    marginTop: isExpanded ? '170px' : '-180px',
  };
  const showHideXAnimationOptions = {
    opacity: isExpanded ? 0 : 1,
    display: isExpanded ? 'none' : 'inline',
  };
  const hamburgerSlideDownAnimation = useSpring({
    to: [
      slideDownAnimationOptions
    ],
    from: slideDownAnimationOptions
  });

  const showHamburgerHideXAnimation = useSpring({
    to: [
      showHideXAnimationOptions
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
    from: showHideXAnimationOptions
  });

  const handleToggle = () => {
    setIsExpanded((prevExpanded) => !prevExpanded);
  };

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
          onClick={handleToggle}
          className="text-gray-900 fill-current"
          xmlns="https://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </animated.svg>
        <animated.svg
          id="xsvg"
          onClick={handleToggle}
          style={showXHideHamburgerAnimation}
          xmlns="https://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-x"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </animated.svg>
      </label>
      {isExpanded && (
        <animated.div
          style={hamburgerSlideDownAnimation}
          id="mobile-menu"
          className="absolute right-0 z-10 w-full text-center text-black bg-white "
        >
          <Menu/>
        </animated.div>
      )}
    </>
  );
};

export default Hamburger;
