import { FC } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';

import useCartStore from '@/stores/cart';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { getFormattedCart } from '@/utils/functions/functions';

interface ICartProps {
  stickyNav?: boolean;
}

/**
 * Displays the shopping cart contents.
 * Displays amount of items in cart.
 */
const Cart: FC<ICartProps> = ({ stickyNav }) => {
  const { cart, setCart, isLoading } = useCartStore();
  
  const { loading: queryLoading, error } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      const updatedCart = getFormattedCart(data);
      if (!cart || cart.totalProductsCount !== updatedCart?.totalProductsCount) {
        setCart(updatedCart || null);
      }
    },
    onError: (error) => {
      console.error('Error fetching cart:', error);
      // On error, we'll show the cached cart data instead of setting to null
    },
    // Fetch policy to ensure we get fresh data while respecting cache
    fetchPolicy: 'cache-and-network',
  });

  // Use query loading state in combination with store loading state
  const productCount = (!isLoading && !queryLoading) ? cart?.totalProductsCount : undefined;

  return (
    <>
      <Link href="/handlekurv">
        <span
          className="pl-4 mt-4 no-underline inline-block"
          aria-label="Handlekurv"
        >
          <svg
            className={`${stickyNav ? 'fill-white' : 'fill-current'}`}
            xmlns="https://www.w3.org/2000/svg"
            width="55"
            height="55"
            viewBox="0 0 30 30"
            aria-label="Handlekurv"
          >
            <path
              d="M21,7H7.462L5.91,3.586C5.748,3.229,5.392,3,5,3H2v2h2.356L9.09,15.414C9.252,15.771,9.608,16,10,16h8 c0.4,0,0.762-0.238,0.919-0.606l3-7c0.133-0.309,0.101-0.663-0.084-0.944C21.649,7.169,21.336,7,21,7z M17.341,14h-6.697L8.371,9 h11.112L17.341,14z"
              aria-label="Handlekurv"
            />
            <circle cx="10.5" cy="18.5" r="1.5" aria-label="Handlekurv" />
            <circle cx="17.5" cy="18.5" r="1.5" aria-label="Handlekurv" />
          </svg>
        </span>
      </Link>

      {productCount ? (
        <span
          className={`w-6 h-6 pb-2 -mt-5 !-ml-2 text-center rounded-full
          ${stickyNav ? 'text-black bg-white' : 'text-white bg-black'}`}
        >
          {productCount}
        </span>
      ) : null}
    </>
  );
};

export default Cart;
