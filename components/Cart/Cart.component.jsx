import { useState, useContext } from 'react';
import { useSpring, animated } from 'react-spring';
import Link from 'next/link';

import { AppContext } from 'utils/context/AppContext';
import SVGCloseX from '../SVG/SVGCloseX.component';

/**
 * Displays the shopping cart contents.
 * Currently only displays a sample cart.
 * Displays amount of items in cart.
 */
const Cart = () => {
  const [isExpanded, setisExpanded] = useState(false);
  const [cart, setCart] = useContext(AppContext);

  const productsCount =
    null !== cart && Object.keys(cart).length ? cart.totalProductsCount : '';

  const animation = useSpring({
    to: [
      {
        opacity: isExpanded ? 1 : 0,
        marginRight: isExpanded ? '0px' : '-300px',
      },
    ],
    from: {
      opacity: isExpanded ? 1 : 0,
      marginRight: isExpanded ? '0px' : '-300px',
    },
  });
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
      {/*Cart quantity */}
      {productsCount && (
        <span
          onClick={() => {
            setisExpanded(!isExpanded);
          }}
          className="w-6 h-6 pb-2 -mt-6 text-center text-white bg-black rounded-full"
        >
          {productsCount}
        </span>
      )}

      {/*Animate slide-in*/}
      {isExpanded && (
        <animated.div
          style={animation}
          id="cart-div"
          className="fixed top-0 right-0 z-50 h-full mr-0 text-center text-black bg-white"
        >
          <div className="right-0 pr-2 ml-48 text-lg cursor-pointer">
            <SVGCloseX isExpanded={isExpanded} setisExpanded={setisExpanded} />
          </div>

          <div className="mt-10 text-2xl text-center border-b-2 border-gray-400 border-solid">
            HANDLEKURV
          </div>
          <div className="mt-4">
            {/*Start product listing inside of cart*/}
            <div className="flex p-4 mt-2 border-b border-gray-400 border-solid">
              <div className="fixed right-0 mt-0 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <img
                className="w-24"
                src="http://davethemogul.com/wp-content/uploads/2020/05/lynne-baltzer-_Qqfhl2sCFE-unsplash-scaled.jpg"
              />
              <div className="ml-8 text-left">
                Testprodukt 1 <br className="mt-2" />
                Farge: Rød <br className="mt-2" /> Str: Large
                <br className="mt-2" />
                <span className="font-bold">1 x KR 599</span>
                <br className="mt-4" />
              </div>
            </div>
            <div className="flex p-4 mt-2 border-b border-gray-400 border-solid">
              <div className="fixed right-0 mt-0 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <img
                className="w-24"
                src="http://davethemogul.com/wp-content/uploads/2020/05/rezasaad-w0J1odQXj3A-unsplash-scaled.jpg"
              />
              <div className="ml-8 text-left">
                Testprodukt 2 <br className="mt-2" />
                Farge: Blå <br className="mt-2" /> Str: Large
                <br className="mt-2" />
                <span className="font-bold">1 x KR 599</span>
                <br className="mt-4" />
              </div>
            </div>
            {
              // End product listing inside of cart
            }
            <div className="mx-auto mt-6">
              <button className="px-4 py-2 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
                <Link href="/cart">
                  <a>GÅ TIL KASSE</a>
                </Link>
              </button>
            </div>
          </div>
        </animated.div>
      )}
    </>
  );
};

export default Cart;
