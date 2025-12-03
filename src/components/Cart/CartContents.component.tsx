import { useMutation, useQuery } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Container } from '@/components/Layout/Container.component';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/ui/Price.component';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from '@/components/ui/Typography.component';
import { useCartStore } from '@/stores/cartStore';
import { ConfigurationDisplay } from './ConfigurationDisplay.component';

import {
  getFormattedCart,
  getUpdatedItems,
  handleQuantityChange,
  IProductRootObject,
} from '@/utils/functions/functions';

import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

const CartContents = () => {
  const router = useRouter();
  const { clearWooCommerceSession, syncWithWooCommerce } = useCartStore();
  const isCheckoutPage = router.pathname === '/checkout';

  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  });

  // Sync cart to Zustand/localStorage when server/cart data changes
  useEffect(() => {
    if (!data) return;
    if (!(data as any)?.cart?.contents?.nodes) return;
    const updatedCart = getFormattedCart(data as any);
    if (!updatedCart && !data?.cart?.contents?.nodes?.length) {
      clearWooCommerceSession();
      return;
    }
    if (updatedCart) {
      syncWithWooCommerce(updatedCart);
    }
  }, [data, clearWooCommerceSession, syncWithWooCommerce]);

  const [updateCart, { loading: updateCartProcessing, data: updateCartData }] =
    useMutation(UPDATE_CART);

  // Handle update cart completion with useEffect instead of deprecated onCompleted
  useEffect(() => {
    if (updateCartData) {
      refetch();
      setTimeout(() => {
        refetch();
      }, 3000);
    }
  }, [updateCartData, refetch]);

  const handleRemoveProductClick = (
    cartKey: string,
    products: IProductRootObject[],
  ) => {
    if (products?.length) {
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
    refetch();
    setTimeout(() => {
      refetch();
    }, 3000);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const cartTotal = data?.cart?.total || '0';

  const getUnitPrice = (subtotal: string, quantity: number) => {
    const numericSubtotal = parseFloat(subtotal.replace(/[^0-9.-]+/g, ''));
    return isNaN(numericSubtotal)
      ? 'N/A'
      : (numericSubtotal / quantity).toFixed(2);
  };

  return (
    <Container paddingClassName="px-4 py-8">
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
                  <TypographyH3>{item.product.node.name}</TypographyH3>
                  <TypographyP className="text-gray-600">
                    <Price
                      value={`${getUnitPrice(item.subtotal, item.quantity)}`}
                      size="sm"
                    />
                  </TypographyP>
                  <ConfigurationDisplay extraData={item.extraData} />
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => {
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
                    onClick={() =>
                      handleRemoveProductClick(
                        item.key,
                        data.cart.contents.nodes,
                      )
                    }
                    variant="destructive"
                    disabled={updateCartProcessing}
                  >
                    Remove
                  </Button>
                </div>
                <div className="ml-4">
                  <Price value={item.subtotal} size="lg" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-6 md:w-full">
            <div className="flex justify-end mb-4">
              <span className="font-semibold pr-2">Subtotal:</span>
              <Price value={cartTotal} size="lg" />
            </div>
            {!isCheckoutPage && (
              <div className="flex justify-center mb-4">
                <Button variant="default" className="w-full md:w-auto" asChild>
                  <Link href="/checkout">PROCEED TO CHECKOUT</Link>
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <TypographyH2 className="mb-4">No products in cart</TypographyH2>
          <Button variant="default" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      )}
      {updateCartProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg min-w-[300px]">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CartContents;
