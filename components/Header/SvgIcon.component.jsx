import React from 'react';

const SvgIcon = function (mode, styledAnimation, handleToggle) {
    const xMode = mode === 'xsvg';
    return (
      <animated.svg
          id={mode}
          onClick={handleToggle}
          style={styledAnimation}
          xmlns="https://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill={xMode && 'none'}
          stroke={xMode && 'currentColor'}
          strokeWidth={xMode && 2}
          strokeLinecap={xMode && 'round'}
          strokeLinejoin={xMode && 'round'}
          className={xMode ? 'feather feather-x' : 'text-gray-900 fill-current'}
        >
          {xMode ?
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </> :
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
          }
        </animated.svg>
    );
};

export default SvgIcon;
