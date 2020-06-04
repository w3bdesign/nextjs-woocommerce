import { useState } from 'react';
import { useSpring, animated } from 'react-spring';

import MobileSearch from './MobileSearch.component';
import CloseXSVG from './SVGCloseX.component';

/**
 * The SVG that we use for search in the navbar for mobile.
 * Also includes logic for closing and opening the search form.
 */
const MobileSearchSVGIcon = () => {
  const [isExpanded, setisExpanded] = useState(false);

  const mobileSearchSlideDownAnimation = useSpring({
    to: [
      {
        opacity: isExpanded ? 1 : 0,
        marginTop: isExpanded ? '30px' : '-180px',
      },
    ],
    from: {
      opacity: isExpanded ? 1 : 0,
      marginTop: isExpanded ? '30px' : '-180px',
    },
  });

  return (
    <>
      <div className="inline mr-2 md:hidden xl:hidden">
        <svg
          className="cursor-pointer"
          onClick={() => {
            setisExpanded(!isExpanded);
          }}
          fill="#000000"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="20px"
          height="20px"
        >
          <path d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z" />
        </svg>
      </div>
      {isExpanded && (
        <animated.div
          style={mobileSearchSlideDownAnimation}
          className="absolute right-0 z-50 w-full p-4 text-black bg-white"
        >
          <div className="absolute right-0 mr-6 -mt-12 cursor-pointer">
            <CloseXSVG isExpanded={isExpanded} setisExpanded={setisExpanded} />
          </div>
          <br />
          <MobileSearch />
        </animated.div>
      )}
    </>
  );
};

export default MobileSearchSVGIcon;
