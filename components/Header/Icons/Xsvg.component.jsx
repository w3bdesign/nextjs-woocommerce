import React from 'react';

const Xsvg = (styledAnimation, handleToggle) => (
  <animated.svg
    id="xsvg"
    onClick={handleToggle}
    style={styledAnimation}
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
);

export default Xsvg;
