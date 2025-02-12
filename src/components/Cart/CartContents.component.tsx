import { ChangeEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

import useCartStore, { RootObject, Product } from '@/stores/cart';
import Button from '@/components/UI/Button.component';

import {
  getFormattedCart,
  handleQuantityChange,
} from '@/utils/functions/functions';

import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

const CartContents = () => {
  const router = useRouter();
  const { cart, setCart } = useCartStore();
  const isCheckoutPage = router.pathname === '/kasse';

  useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      // Only update if there's a significant difference to avoid unnecessary re-renders
      const updatedCart = getFormattedCart(data) as RootObject | undefined;
      if (!cart || cart.totalProductsCount !== updatedCart?.totalProductsCount) {
        setCart(updatedCart || null);
      }
    },
  });

  const [updateCart] = useMutation(UPDATE_CART);

  const handleRemoveProductClick = (cartKey: string) => {
    // Update local state
    useCartStore.getState().removeProduct(cartKey);

    // Update remote state in background
    updateCart({
      variables: {
        input: {
          clientMutationId: uuidv4(),
          items: [{
            key: cartKey,
            quantity: 0
          }],
        },
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {cart?.products?.length ? (
        <>
          <div className="bg-white rounded-lg p-6 mb-8 md:w-full">
            {cart.products.map((item: Product) => (
              <div
                key={item.cartKey}
                className="flex items-center border-b border-gray-200 py-4"
              >
                <div className="flex-shrink-0 w-24 h-24 relative hidden md:block">
                  <Image
                    src={item.image?.sourceUrl || '/placeholder.png'}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
                <div className="flex-grow ml-4">
                  <h2 className="text-lg font-semibold">
                    {item.name}
                  </h2>
                  <p className="text-gray-600">
                    kr {item.price}
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const newQty = parseInt(event.target.value, 10);
                      if (isNaN(newQty) || newQty < 1) return;

                      // Update local state
                      useCartStore.getState().updateProductQuantity(item.cartKey, newQty);

                      // Update remote state in background
                      handleQuantityChange(
                        event,
                        item.cartKey,
                        newQty,
                        updateCart
                      );
                    }}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded mr-2"
                  />
                  <Button
                    handleButtonClick={() => handleRemoveProductClick(item.cartKey)}
                    variant="secondary"
                  >
                    Fjern
                  </Button>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold">{item.totalPrice}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-6 md:w-full">
            <div className="flex justify-end mb-4">
              <span className="font-semibold pr-2">Subtotal:</span>
              <span>{cart.totalProductsPrice}</span>
            </div>
            {!isCheckoutPage && (
              <div className="flex justify-center mb-4">
                <Link href="/kasse" passHref>
                  <Button variant="primary" fullWidth>GÅ TIL KASSE</Button>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ingen produkter i handlekurven
          </h2>
          <Link href="/produkter" passHref>
            <Button variant="primary">Fortsett å handle</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartContents;
