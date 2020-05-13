// https://easy-peasy.now.sh/

import { useState } from 'react';
import { useSpring, animated } from 'react-spring'

function Cart() {
  const [isExpanded, setisExpanded] = useState(false);
  const animation = useSpring({
    to: [{ opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? '160px' : "-180px" }],
    from: { opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? '160px' : "-180px" }
  })
  return (
    <>
      <a
        className="inline-block pl-3 no-underline hover:text-black"
        href="#cart"
      >
        <svg
          onClick={() => {
            setisExpanded(!isExpanded);
          }}
          className="fill-current hover:text-black"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M21,7H7.462L5.91,3.586C5.748,3.229,5.392,3,5,3H2v2h2.356L9.09,15.414C9.252,15.771,9.608,16,10,16h8 c0.4,0,0.762-0.238,0.919-0.606l3-7c0.133-0.309,0.101-0.663-0.084-0.944C21.649,7.169,21.336,7,21,7z M17.341,14h-6.697L8.371,9 h11.112L17.341,14z" />
          <circle cx="10.5" cy="18.5" r="1.5" />
          <circle cx="17.5" cy="18.5" r="1.5" />
        </svg>
      </a>

      {
        /*
      Animate margin-right and slide-in
        */
      }
       {isExpanded && (
      <animated.div style={animation} className="absolute right-0 z-50 w-64 h-64 mr-0 text-center text-black bg-white">
        Shopping cart
        </animated.div>
       )}

    </>



  );
}

export default Cart;
