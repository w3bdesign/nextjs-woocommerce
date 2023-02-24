// Imports
import { useContext } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';

// State
import { CartContext } from '@/utils/context/CartProvider';

// Utils
import {
  getFormattedCart,
  handleQuantityChange,
} from '@/utils/functions/tfunctions';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';
import Button from '../UI/Button.component';

/**
 * Renders cart contents.
 * @function CartContents
 * @returns {JSX.Element} - Rendered component
 */
const CartContents = () => {
  const { cart, setCart } = useContext(CartContext);

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
      setCart(updatedCart);
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
        {cart ? (
          cart.products.map((item) => (
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
                    className="w-12"
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(event) => {
                      handleQuantityChange(
                        event,
                        item.cartKey,
                        cart.products,
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

        <div className="mt-4 mx-auto">
          <Link href="/kasse" passHref>
            <Button>GÅ TIL KASSE</Button>
          </Link>
        </div>

        
      </div>
    </section>
  );
};

export default CartContents;
