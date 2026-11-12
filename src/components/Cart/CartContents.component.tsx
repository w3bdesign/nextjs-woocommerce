'use client';

import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

import { useCartQuery } from '@/hooks/useCartQuery';
import Button from '@/components/UI/Button.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

import {
  getUpdatedItems,
  handleQuantityChange,
  IProductRootObject,
} from '@/utils/functions/functions';

import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';
import { formatPrice, formatUnitPrice } from '@/utils/functions/price';

const CartContents = () => {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/kasse';

  const { data, refetch } = useCartQuery({ clearEmptyCart: true });

  const [updateCart, { loading: updateCartProcessing }] = useMutation(
    UPDATE_CART,
    {
      onCompleted: () => {
        refetch();
        // Delayed refetch to ensure WooCommerce backend has settled
        setTimeout(() => {
          refetch();
        }, 2000);
      },
    },
  );

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
    // Delayed refetch to ensure WooCommerce backend has settled
    setTimeout(() => {
      refetch();
    }, 2000);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const cartTotal = data?.cart?.total || '0';

  return (
    <div className="py-6 md:container md:mx-auto md:px-4 md:py-8">
      {data?.cart?.contents?.nodes?.length ? (
        <>
          <div className="bg-surface rounded-lg p-2 mb-8 md:p-6 md:w-full">
            {data.cart.contents.nodes.map((item: IProductRootObject) => (
              <div
                key={item.key}
                className="flex gap-3 border-b border-border py-4 md:items-center md:gap-4"
              >
                <div className="relative size-20 flex-shrink-0 md:size-24">
                  <Image
                    src={
                      item.product.node.image?.sourceUrl || '/placeholder.png'
                    }
                    alt={item.product.node.name}
                    fill
                    sizes="(min-width: 768px) 96px, 80px"
                    className="rounded-md object-cover"
                  />
                </div>
                {/* Mobile: name, unit price and controls stack beside the image (name gets the full width).
                    Desktop: name | quantity + remove | line total on one row. */}
                <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
                  <div className="min-w-0 md:flex-1">
                    <h2 className="break-words text-base font-semibold leading-snug text-text md:text-lg">
                      {item.product.node.name}
                    </h2>
                    <p className="whitespace-nowrap text-sm text-text-muted md:text-base">
                      {formatUnitPrice(item.subtotal, item.quantity)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap md:justify-end md:gap-4">
                    <div className="flex items-center gap-2">
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
                        className="h-10 w-16 px-2 py-1 text-center border border-border rounded-md bg-surface focus:ring-2 focus:ring-primary focus:border-primary"
                        aria-label={`Antall ${item.product.node.name}`}
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
                    <p className="whitespace-nowrap text-right text-base font-semibold text-text md:min-w-28 md:text-lg">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-surface rounded-lg p-2 md:p-6 md:w-full">
            <div className="flex justify-between mb-4 md:justify-end">
              <span className="font-semibold pr-2 text-text">Subtotal:</span>
              <span className="whitespace-nowrap text-text">
                {formatPrice(cartTotal)}
              </span>
            </div>
            {!isCheckoutPage && (
              <div className="flex justify-center mb-4">
                <Link href="/kasse" passHref className="w-full md:w-auto">
                  <Button variant="primary" fullWidth>
                    GÅ TIL KASSE
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-text">
            Ingen produkter i handlekurven
          </h2>
          <Link href="/produkter" passHref>
            <Button variant="primary">Fortsett å handle</Button>
          </Link>
        </div>
      )}
      {updateCartProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-overlay bg-opacity-50">
          <div className="bg-surface p-4 rounded-lg">
            <p className="text-lg mb-2 text-text">Oppdaterer handlekurv…</p>
            <LoadingSpinner />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartContents;
