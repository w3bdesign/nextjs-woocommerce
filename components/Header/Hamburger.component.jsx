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
        <SvgIcon mode="hamburgersvg" styledAnimation={showHamburgerHideXAnimation} handleToggle={handleToggle}/>
        <SvgIcon mode="xsvg" styledAnimation={showXHideHamburgerAnimation} handleToggle={handleToggle}/> 
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