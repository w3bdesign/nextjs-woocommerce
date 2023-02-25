// Imports
import { useContext, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

// State
import { CartContext, Product } from '@/utils/context/CartProvider';

// Components
import Button from '@/components/UI/Button.component';

// Utils
import {
  getFormattedCart,
  getUpdatedItems,
  handleQuantityChange,
} from '@/utils/functions/functions';

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

  const { cart, setCart } = useContext(CartContext);

  const isCheckoutPage = router.pathname === '/kasse';

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);

      if (!updatedCart) {
        localStorage.removeItem('woo-session');
        localStorage.removeItem('woo-session-expiry');
        localStorage.removeItem('woocommerce-cart');
        setCart(null);
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

  const handleRemoveProductClick = (cartKey: string, products: Product[]) => {
    if (products.length) {
      // By passing the newQty to 0 in updateCart Mutation, it will remove the item.
      const newQty = 0;
      const updatedItems = getUpdatedItems(products, newQty, cartKey);

      updateCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            items: updatedItems,
          },
        },
      });
    }

    refetch();

    setTimeout(() => {
      refetch();
    }, 3000);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

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
                  <Button
                    color="red"
                    handleButtonClick={() =>
                      handleRemoveProductClick(item.cartKey, cart.products)
                    }
                  >
                    Remove
                  </Button>
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
                        cart,
                        updateCart,
                        updateCartProcessing
                      );

                      setTimeout(() => {
                        refetch();
                      }, 2000);
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
        {!isCheckoutPage && cart && (
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
