import React from 'react';
import { animated } from 'react-spring';

const HamburgerSvg = ({styledAnimation, handleToggle}) => (
  <animated.svg
    id="hamburgersvg"
    onClick={handleToggle}
    style={styledAnimation}
    xmlns="https://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    className="text-gray-900 fill-current"
  >
    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
  </animated.svg>
);

export default HamburgerSvg;
