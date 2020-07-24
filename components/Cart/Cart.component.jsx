import { useContext } from 'react';
import Link from 'next/link';

import { AppContext } from 'utils/context/AppContext';

/**
 * Displays the shopping cart contents.
 * Currently only displays a sample cart.
 * Displays amount of items in cart.
 */
const Cart = () => {
  const [cart, setCart] = useContext(AppContext);

  const productsCount =
    null !== cart && Object.keys(cart).length ? cart.totalProductsCount : '';

  return (
    <>
      <Link href="/handlekurv">
        <a
          className="inline-block pl-3 no-underline hover:text-black"
          aria-label="Handlekurv"
        >
          <svg
            className="fill-current hover:text-black"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-label="Handlekurv"
          >
            <path
              d="M21,7H7.462L5.91,3.586C5.748,3.229,5.392,3,5,3H2v2h2.356L9.09,15.414C9.252,15.771,9.608,16,10,16h8 c0.4,0,0.762-0.238,0.919-0.606l3-7c0.133-0.309,0.101-0.663-0.084-0.944C21.649,7.169,21.336,7,21,7z M17.341,14h-6.697L8.371,9 h11.112L17.341,14z"
              aria-label="Handlekurv"
            />
            <circle cx="10.5" cy="18.5" r="1.5" aria-label="Handlekurv" />
            <circle cx="17.5" cy="18.5" r="1.5" aria-label="Handlekurv" />
          </svg>
        </a>
      </Link>
      {/*Cart quantity */}
      {productsCount && (
        <span className="w-6 h-6 pb-2 -mt-6 text-center text-white bg-black rounded-full">
          {productsCount}
        </span>
      )}
    </>
  );
};

export default Cart;
