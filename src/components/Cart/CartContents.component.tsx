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

const stepperButtonClasses =
  'flex h-full w-10 items-center justify-center text-lg text-text transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40';

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

  /** Set a cart line to an exact quantity (0 removes it). */
  const setQuantity = (
    cartKey: string,
    quantity: number,
    products: IProductRootObject[],
  ) => {
    if (updateCartProcessing || !products?.length || quantity < 0) return;
    updateCart({
      variables: {
        input: {
          clientMutationId: uuidv4(),
          items: getUpdatedItems(products, quantity, cartKey),
        },
      },
    });
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const cartTotal = data?.cart?.total || '0';
  const products: IProductRootObject[] = data?.cart?.contents?.nodes ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl py-6 md:py-8">
      {products.length ? (
        <>
          <ul className="divide-y divide-border border-y border-border">
            {products.map((item) => {
              const { name, image } = item.product.node;

              return (
                <li key={item.key} className="flex gap-4 py-5">
                  <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-md bg-surface-alt sm:size-24">
                    <Image
                      src={image?.sourceUrl || '/placeholder.png'}
                      alt={name}
                      fill
                      sizes="(min-width: 640px) 96px, 80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    {/* Product info and line total: stacked on small phones,
                        side by side (total on the right) from the sm breakpoint */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <h2 className="break-words text-base font-semibold leading-snug text-text sm:text-lg">
                          {name}
                        </h2>
                        <p className="mt-1 whitespace-nowrap text-sm text-text-muted">
                          {formatUnitPrice(item.subtotal, item.quantity)} per
                          stk
                        </p>
                      </div>
                      <p className="whitespace-nowrap text-base font-semibold text-text sm:text-lg">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>

                    {/* Bottom line: quantity stepper on the left, remove on the right */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-border">
                        <button
                          type="button"
                          className={stepperButtonClasses}
                          onClick={() =>
                            setQuantity(item.key, item.quantity - 1, products)
                          }
                          disabled={updateCartProcessing || item.quantity <= 1}
                          aria-label={`Reduser antall ${name}`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(event) => {
                            handleQuantityChange(
                              event,
                              item.key,
                              products,
                              updateCart,
                              updateCartProcessing,
                            );
                          }}
                          className="h-full w-12 border-x border-border bg-transparent text-center text-sm text-text focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          aria-label={`Antall ${name}`}
                        />
                        <button
                          type="button"
                          className={stepperButtonClasses}
                          onClick={() =>
                            setQuantity(item.key, item.quantity + 1, products)
                          }
                          disabled={updateCartProcessing}
                          aria-label={`Øk antall ${name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, 0, products)}
                        disabled={updateCartProcessing}
                        className="inline-flex h-10 items-center gap-1.5 rounded-md border border-error px-3 text-sm font-semibold text-error transition-colors hover:bg-error hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Fjern ${name} fra handlekurven`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-4"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                        Fjern
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="pt-5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-base font-semibold text-text">
                Subtotal
              </span>
              <span className="whitespace-nowrap text-lg font-semibold text-text">
                {formatPrice(cartTotal)}
              </span>
            </div>
            {!isCheckoutPage && (
              <div className="mt-5 flex md:justify-end">
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
