import { ChangeEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

import useCartStore, { RootObject, Product } from '@/stores/cart';
import Button from '@/components/UI/Button.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

import {
  getFormattedCart,
  getUpdatedItems,
  handleQuantityChange,
  IProductRootObject,
} from '@/utils/functions/functions';

import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

const CartContents = () => {
  const router = useRouter();
  const { cart, setCart } = useCartStore();
  const isCheckoutPage = router.pathname === '/kasse';

  const { data } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      const updatedCart = getFormattedCart(data) as RootObject | undefined;
      setCart(updatedCart || null);
    },
  });

  const [updateCart, { loading: updateCartProcessing }] = useMutation(
    UPDATE_CART,
    {
      refetchQueries: [{ query: GET_CART }],
      awaitRefetchQueries: true,
    },
  );

  const handleRemoveProductClick = (
    cartKey: string,
    products: IProductRootObject[],
  ) => {
    if (products?.length) {
      // Optimistically update local state
      const currentCart = cart;
      if (currentCart) {
        const updatedProducts = currentCart.products.filter((p: Product) => p.cartKey !== cartKey);
        setCart({
          ...currentCart,
          products: updatedProducts,
          totalProductsCount: currentCart.totalProductsCount - 1
        });
      }

      // Update remote state in background
      const updatedItems = getUpdatedItems(products, 0, cartKey);
      updateCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            items: updatedItems,
          },
        },
      });

    }
  };

  const cartTotal = data?.cart?.total || '0';

  const getUnitPrice = (subtotal: string, quantity: number) => {
    const numericSubtotal = parseFloat(subtotal.replace(/[^0-9.-]+/g, ''));
    return isNaN(numericSubtotal)
      ? 'N/A'
      : (numericSubtotal / quantity).toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {data?.cart?.contents?.nodes?.length ? (
        <>
          <div className="bg-white rounded-lg p-6 mb-8 md:w-full">
            {data.cart.contents.nodes.map((item: IProductRootObject) => (
              <div
                key={item.key}
                className="flex items-center border-b border-gray-200 py-4"
              >
                <div className="flex-shrink-0 w-24 h-24 relative hidden md:block">
                  <Image
                    src={
                      item.product.node.image?.sourceUrl || '/placeholder.png'
                    }
                    alt={item.product.node.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
                <div className="flex-grow ml-4">
                  <h2 className="text-lg font-semibold">
                    {item.product.node.name}
                  </h2>
                  <p className="text-gray-600">
                    kr {getUnitPrice(item.subtotal, item.quantity)}
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const newQty = parseInt(event.target.value, 10);
                      if (isNaN(newQty) || newQty < 1) return;

                      // Optimistically update local state
                      if (cart) {
                        const oldProduct = cart.products.find((p: Product) => p.cartKey === item.key);
                        const oldQty = oldProduct?.qty || 0;
                        const updatedProducts = cart.products.map((p: Product) => 
                          p.cartKey === item.key ? { ...p, qty: newQty } : p
                        );
                        
                        // Calculate new total count
                        const qtyDiff = newQty - oldQty;
                        const newTotalCount = cart.totalProductsCount + qtyDiff;
                        
                        setCart({
                          ...cart,
                          products: updatedProducts,
                          totalProductsCount: newTotalCount
                        });
                      }

                      // Update remote state in background
                      handleQuantityChange(
                        event,
                        item.key,
                        data.cart.contents.nodes,
                        updateCart,
                        updateCartProcessing,
                      );
                    }}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded mr-2"
                  />
                  <Button
                    handleButtonClick={() =>
                      handleRemoveProductClick(
                        item.key,
                        data.cart.contents.nodes,
                      )
                    }
                    variant="secondary"
                    buttonDisabled={updateCartProcessing}
                  >
                    Fjern
                  </Button>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold">{item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-6 md:w-full">
            <div className="flex justify-end mb-4">
              <span className="font-semibold pr-2">Subtotal:</span>
              <span>{cartTotal}</span>
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
      {updateCartProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-lg mb-2">Oppdaterer handlekurv...</p>
            <LoadingSpinner />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartContents;
