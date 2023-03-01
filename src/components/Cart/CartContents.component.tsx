/*eslint complexity: ["error", 20]*/
// Imports
import { useContext, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

// State
import { CartContext } from '@/stores/CartProvider';

// Components
import Button from '@/components/UI/Button.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

// Utils
import {
  getFormattedCart,
  getUpdatedItems,
  handleQuantityChange,
  IProductRootObject,
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

  const { setCart } = useContext(CartContext);

  const isCheckoutPage = router.pathname === '/kasse';

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);

      if (!updatedCart && !data.cart.contents.nodes.length) {
        // Clear the localStorage if we have no remote cart

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
        setTimeout(() => {
          refetch();
        }, 3000);
      },
    }
  );

  const handleRemoveProductClick = (
    cartKey: string,
    products: IProductRootObject[]
  ) => {
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
        {data?.cart?.contents?.nodes.length ? (
          data.cart.contents.nodes.map((item: IProductRootObject) => (
            <div
              className="container mx-auto mt-4 flex flex-wrap flex-row justify-around items-center content-center m-w-[1380px] border border-gray-300 rounded-lg shadow
               "
              key={item.key}
            >
              <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                <span className="block mt-2 font-extrabold">
                  Slett: <br />
                </span>
                <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                  <Button
                    color="red"
                    buttonDisabled={updateCartProcessing}
                    handleButtonClick={() =>
                      handleRemoveProductClick(
                        item.key,
                        data.cart.contents.nodes
                      )
                    }
                  >
                    Slett
                  </Button>
                </span>
              </div>
              <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                <span className="block mt-2 font-extrabold">
                  Navn: <br />
                </span>
                <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                  {item.product.node.name}
                </span>
              </div>
              <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                <span className="block mt-2 font-extrabold">
                  Antall: <br />
                </span>
                <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                  <input
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => {
                      handleQuantityChange(
                        event,
                        item.key,
                        data.cart.contents.nodes,
                        updateCart,
                        updateCartProcessing
                      );
                    }}
                  />
                </span>
              </div>
              <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                <span className="block mt-2 font-extrabold">
                  Total: <br />
                </span>
                <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                  {item.subtotal}
                </span>
              </div>
            </div>
          ))
        ) : (
          <h1 className="text-2xl font-bold mx-auto">
            Ingen produkter i handlekurven
          </h1>
        )}
        {updateCartProcessing && (
          <div className="mt-4 w-full">
            <div className="text-xl mx-auto text-center">
              Oppdaterer antall, vennligst vent ...
              <LoadingSpinner />
            </div>
          </div>
        )}
        {!isCheckoutPage && data?.cart?.contents?.nodes.length ? (
          <div className="mt-4 mx-auto">
            <Link href="/kasse" passHref>
              <Button>GÅ TIL KASSE</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CartContents;
