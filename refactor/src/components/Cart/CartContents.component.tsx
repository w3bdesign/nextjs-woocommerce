// Imports
import { useContext } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';

// State
import { CartContext } from '@/utils/context/CartProvider';

// Components
import Button from '@/components/UI/Button.component';

// Utils
import {
  getFormattedCart,
  handleQuantityChange,
} from '@/utils/functions/tfunctions';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

/**
 * Renders cart contents.
 * @function CartContents
 * @returns {JSX.Element} - Rendered component
 */
const CartContents = () => {
  const router = useRouter();

  const { cartData } = useContext(CartContext);

  const isCheckoutPage = router.pathname === '/kasse';

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);

      if (!updatedCart) {
        return;
      }

      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));

      // Update cart data in React Context.
      cartData.setCart(updatedCart);
    },
  });

  // Update Cart Mutation.
  const [updateCart, { loading: updateCartProcessing }] = useMutation(
    UPDATE_CART,
    {
      onCompleted: () => {
        refetch();
      },
    }
  );

  return (
    <section className="py-8  mt-10">
      <div className="container flex flex-wrap items-center mx-auto">
        {cartData.cart ? (
          cartData.cart.products.map((item: any) => (
            <div
              className="container mx-auto mt-4 flex flex-wrap flex-row justify-around items-center content-center m-w-[1380px] border border-gray-300 rounded-lg shadow
               "
              key={item.cartKey}
            >
              <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                <span className="block mt-2 font-extrabold">
                  Remove: <br />
                </span>
                <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                  REMOVE
                </span>
              </div>

              <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                <span className="block mt-2 font-extrabold">
                  Name: <br />
                </span>
                <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                  {item.name}
                </span>
              </div>

              <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                <span className="block mt-2 font-extrabold">
                  Quantity: <br />
                </span>
                <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                  <input
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(event) => {
                      handleQuantityChange(
                        event,
                        item.cartKey,
                        cartData,
                        updateCart,
                        updateCartProcessing
                      );

                      setTimeout(() => {
                        refetch();
                      }, 3000);
                    }}
                  />
                </span>
              </div>

              <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                <span className="block mt-2 font-extrabold">
                  Subtotal: <br />
                </span>
                <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                  {item.totalPrice}
                </span>
              </div>
            </div>
          ))
        ) : (
          <h1 className="text-2xl font-bold mx-auto">
            Ingen produkter i handlekurven
          </h1>
        )}
        {!isCheckoutPage && (
          <div className="mt-4 mx-auto">
            <Link href="/kasse" passHref>
              <Button>GÅ TIL KASSE</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartContents;
