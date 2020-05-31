import { useState } from 'react';
import { useSpring, animated } from 'react-spring';

import MobileSearch from './MobileSearch.component';

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
        className="absolute right-0 w-full p-4 text-black bg-white z-99"
      >
          <p
            onClick={() => {
              setisExpanded(!isExpanded);
            }}
            className="absolute right-0 mr-12 -mt-6 text-lg"
          >
            LUKK{' '}
          </p>
          <svg
            id="xsvg"
            className="absolute right-0 mr-6 -mt-6"
            onClick={() => {
              setisExpanded(!isExpanded);
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <br />
          <MobileSearch />
        </animated.div>
      )}
    </>
  );
};

export default MobileSearchSVGIcon;
